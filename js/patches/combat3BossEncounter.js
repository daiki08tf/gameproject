import { BattleEngine } from '../battleEngine.js';
import { bossEncounterProfile } from '../data/bossEncounters.js';

const MAX_ENCOUNTER_ENEMIES=5;

function encounterOf(boss){ return boss?.combat3Encounter||null; }
function guardAlive(engine,boss){
  return engine.aliveEnemies.some(e=>!e.boss&&e.combat3EncounterGuard&&e.combat3EncounterOwnerId===boss.id);
}
function spawnAdds(engine,boss,defs){
  const added=[];
  for(const def of defs||[]){
    for(let i=0;i<(def.count||1);i++){
      if(engine.aliveEnemies.length>=MAX_ENCOUNTER_ENEMIES)break;
      const e=engine._spawnEnemy(def.type);
      if(!e)continue;
      e.combat3EncounterOwnerId=boss.id;
      e.combat3EncounterGuard=!!def.guard;
      e.combat3EncounterMinion=true;
      engine.enemies.push(e);
      engine.totalToDefeat++;
      added.push({id:e.id,name:e.name,guard:!!def.guard});
    }
  }
  return added;
}
function accelerateBossAI(boss,mult){
  if(!(mult>0&&mult<1))return;
  for(const k of ['slamTurns','chargeTurns','projectileTurns','summonTurns']){
    if(Number.isFinite(boss[k]))boss[k]=Math.max(1,Math.round(boss[k]*mult));
  }
}
function openBreakWindow(boss,pct){
  if(!(pct>0&&pct<=1)||!(boss.breakMax>0))return null;
  const before=Math.max(0,boss.breakGauge??boss.breakMax);
  const target=Math.max(1,Math.round(boss.breakMax*pct));
  boss.breakGauge=Math.min(before,target);
  return {before,after:boss.breakGauge,max:boss.breakMax,pct};
}
function applyPhase(engine,boss,phase){
  if(phase.atkMult)boss.atk=Math.max(1,Math.round(boss.atk*phase.atkMult));
  if(phase.defMult)boss.def=Math.max(0,Math.round(boss.def*phase.defMult));
  if(phase.spdMult)boss.spd=Math.max(1,Math.round(boss.spd*phase.spdMult));
  accelerateBossAI(boss,phase.accelerateBossAI);
  const breakWindow=openBreakWindow(boss,phase.breakGaugePct);
  return {
    phaseName:phase.name,
    added:spawnAdds(engine,boss,phase.spawn),
    guardActive:guardAlive(engine,boss),
    atkMult:phase.atkMult||1,defMult:phase.defMult||1,spdMult:phase.spdMult||1,
    aiAccelerated:!!phase.accelerateBossAI,
    breakWindow,
  };
}

const proto=BattleEngine.prototype;

// Boss group開始時に取り巻きを編成し、BossへEncounter状態を付与する。
const originalBegin=proto.beginNextEncounter;
proto.beginNextEncounter=function combat3BossEncounterBegin(){
  const event=originalBegin.call(this);
  if(!event)return event;
  const boss=this.aliveEnemies.find(e=>e.boss);
  if(!boss)return event;
  const profile=bossEncounterProfile(boss.type);
  if(!profile)return event;
  boss.combat3Encounter={profile,nextPhase:0};
  const added=spawnAdds(this,boss,profile.startEscorts);
  if(added.length){
    event.enemies.push(...added.map(e=>({id:e.id,name:e.name,boss:false,elite:false,encounterGuard:e.guard})));
    event.bossEncounter=true;
  }
  if(profile.counterHint)event.bossCounterHint=profile.counterHint;
  if(profile.dangerTags)event.bossDangerTags=[...profile.dangerTags];
  return event;
};

// 守護役が生存中はBoss DEFを上げる。ダメージそのものを後段で削る方式では
// ないため、プレイヤー側の表示ダメージと実HP減少量が一致する。
const originalEffective=proto._effectiveEnemyStat;
proto._effectiveEnemyStat=function combat3BossEncounterEffective(enemy,stat){
  let value=originalEffective.call(this,enemy,stat);
  if(stat==='def'&&enemy?.boss){
    const enc=encounterOf(enemy);
    if(enc&&guardAlive(this,enemy))value*=enc.profile.guardDefMult||1;
  }
  return value;
};

// 追加取り巻きはBoss Encounterのギミックであり、無限召喚/周回による
// EXP・Gold・Drop養殖を防ぐ。onKillはビルド体験維持のため通常通り発火する。
const originalGrant=proto._grantKillRewards;
proto._grantKillRewards=function combat3BossEncounterGrant(enemy){
  if(!enemy?.combat3EncounterMinion)return originalGrant.call(this,enemy);
  enemy._rewardsGranted=true;
  const onKillEvents=this.applyEffect('onKill',{enemy});
  return {xp:0,gold:0,leveledUp:false,drops:[],manastone:0,onKillEvents,bossSlayerBuff:false,encounterMinion:true};
};

// HP閾値を跨いだBossは、その手番から新形態へ移行する。Phase 9.2では
// 一部形態変化でBreak Gaugeを現在値より低くし、短い反撃窓を作る。
// 既に十分削れているGaugeを逆に回復させないため min(current,target) とする。
const originalEnemyTurn=proto.performEnemyTurn;
proto.performEnemyTurn=function combat3BossEncounterTurn(enemy){
  let phaseResult=null;
  if(enemy?.boss&&!enemy.dead){
    const enc=encounterOf(enemy);
    const phase=enc?.profile?.phases?.[enc.nextPhase];
    if(phase&&enemy.maxHp>0&&enemy.hp/enemy.maxHp<=phase.ratio){
      enc.nextPhase++;
      phaseResult=applyPhase(this,enemy,phase);
    }
  }
  const result=originalEnemyTurn.call(this,enemy);
  if(result&&phaseResult){
    result.phased=true;
    result.encounterPhase=phaseResult;
    result.name=`${result.name}「${phaseResult.phaseName}」`;
  }
  return result;
};

export function combat3BossGuardActive(engine,boss){ return guardAlive(engine,boss); }
export function combat3BossEncounterState(boss){
  const enc=encounterOf(boss);
  return enc?{
    id:enc.profile.id,nextPhase:enc.nextPhase,phaseCount:enc.profile.phases.length,
    counterHint:enc.profile.counterHint||null,dangerTags:[...(enc.profile.dangerTags||[])],
  }:null;
}
