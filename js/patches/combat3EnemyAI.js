import { BattleEngine } from '../battleEngine.js';
import { enemyCombatProfile, enemyRole } from '../data/enemyCombat3.js';

const proto=BattleEngine.prototype;
const originalSpawn=proto._spawnEnemy;
proto._spawnEnemy=function(type){
  const e=originalSpawn.call(this,type); const profile=enemyCombatProfile(type),role=enemyRole(type);
  if(!e.boss){e.combat3Role=role;e.combat3Skill=profile.skill;e.combat3SkillCd=0;e.combat3Buffs={def:{mult:1,turns:0},spd:{mult:1,turns:0}};e.name=`${role.icon}${e.name}`;}
  return e;
};

const originalEffective=proto._effectiveEnemyStat;
proto._effectiveEnemyStat=function(enemy,stat){
  let v=originalEffective.call(this,enemy,stat);const b=enemy?.combat3Buffs?.[stat];if(b&&b.turns>0)v*=b.mult;return v;
};

function tickBuffs(enemy){
  if(enemy.combat3SkillCd>0)enemy.combat3SkillCd--;
  for(const b of Object.values(enemy.combat3Buffs||{}))if(b.turns>0){b.turns--;if(b.turns<=0)b.mult=1;}
}
function skillLabel(enemy,skill){return `${enemy.name}「${skill.name}」`;}
function doHit(engine,enemy,skill,power=1){
  const atk=engine._effectiveEnemyStat(enemy,'atk')*power;
  if(Math.random()<engine._effectiveEvasion())return {enemyId:enemy.id,name:skillLabel(enemy,skill),kind:'attack',evaded:true,evadeEvents:engine._onPlayerEvaded(enemy),enemySkill:true,skillName:skill.name};
  const dmg=engine._enemyAttackDamage(atk);engine.player.hp-=dmg;const hurtEvents=engine.applyEffect('onHurt',{attacker:enemy});
  return {enemyId:enemy.id,name:skillLabel(enemy,skill),kind:'attack',damage:dmg,evaded:false,hurtEvents,enemySkill:true,skillName:skill.name};
}
function buffAll(engine,stat,pct,turns){for(const ally of engine.aliveEnemies){ally.combat3Buffs=ally.combat3Buffs||{};ally.combat3Buffs[stat]={mult:1+pct,turns};}}
function lowestInjured(engine){return engine.aliveEnemies.filter(e=>e.hp<e.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]||null;}
function performSkill(engine,enemy,skill){
  let result;
  switch(skill.kind){
    case 'power': result=doHit(engine,enemy,skill,skill.power);break;
    case 'multi': {
      let total=0,evadedAll=true,lastEvents=[];for(let i=0;i<(skill.hits||2);i++){const r=doHit(engine,enemy,skill,skill.power);if(!r.evaded){total+=r.damage;evadedAll=false;lastEvents.push(...(r.hurtEvents||[]));}if(engine.player.hp<=0)break;}
      result={enemyId:enemy.id,name:skillLabel(enemy,skill),kind:'attack',damage:total,evaded:evadedAll,hurtEvents:lastEvents,enemySkill:true,skillName:skill.name,multiHits:skill.hits||2};break;
    }
    case 'guardAll': result=doHit(engine,enemy,skill,.72);buffAll(engine,'def',skill.defPct,skill.turns);result.allyBuff={stat:'def',pct:skill.defPct};break;
    case 'hasteAll': result=doHit(engine,enemy,skill,.72);buffAll(engine,'spd',skill.spdPct,skill.turns);result.allyBuff={stat:'spd',pct:skill.spdPct};break;
    case 'healAlly': {
      const target=lowestInjured(engine);result=doHit(engine,enemy,skill,.68);if(target){const amount=Math.max(1,Math.round(target.maxHp*skill.healPct));target.hp=Math.min(target.maxHp,target.hp+amount);result.allyHeal={name:target.name,amount};}break;
    }
    case 'mpDrain': result=doHit(engine,enemy,skill,.78);{const amount=Math.min(engine.player.mp,Math.max(1,Math.round(engine.player.maxMp*skill.mpPct)));engine.player.mp-=amount;result.mpDrained=amount;}break;
    case 'slow': result=doHit(engine,enemy,skill,.82);engine._setBuff('spd',-skill.power,skill.turns);result.playerDebuff={stat:'spd',pct:skill.power};break;
    case 'weakenAtk': result=doHit(engine,enemy,skill,.78);engine._setBuff('atk',-skill.power,skill.turns);result.playerDebuff={stat:'atk',pct:skill.power};break;
    case 'poison': case 'burn': {
      result=doHit(engine,enemy,skill,.82);const extra=Math.max(1,Math.round(engine.player.maxHp*skill.power));engine.player.hp-=extra;result.damage+=extra;result.statusDamage={kind:skill.kind,amount:extra,turns:skill.turns};break;
    }
    default:return null;
  }
  enemy.combat3SkillCd=2;return result;
}

const originalTurn=proto.performEnemyTurn;
proto.performEnemyTurn=function(enemy){
  if(enemy?.boss)return originalTurn.call(this,enemy);
  if(enemy?.dead)return null;
  if(enemy.frozenTurns>0)return originalTurn.call(this,enemy);
  tickBuffs(enemy);
  const skill=enemy.combat3Skill;
  if(skill&&enemy.combat3SkillCd<=0){
    const healReady=skill.kind!=='healAlly'||!!lowestInjured(this);
    if(healReady&&Math.random()<(skill.chance||0)){const r=performSkill(this,enemy,skill);if(r)return r;}
  }
  return originalTurn.call(this,enemy);
};
