/* Enemy 3.0 B2/B9 — deterministic tactical reservation policy for advanced roles. */
import { enemy3WorldTierAiPolicy } from './enemy3WorldTierAI.js';

function ratio(now,max){return max>0?now/max:1;}

export function enemy3TacticalContext(engine,enemy){
  const player=engine?.player||{};
  const allies=(engine?.aliveEnemies||[]).filter(e=>e&&!e.dead);
  const injured=allies.filter(e=>(e.hp??0)<(e.maxHp??0));
  const lowest=injured.sort((a,b)=>ratio(a.hp,a.maxHp)-ratio(b.hp,b.maxHp))[0]||null;
  return Object.freeze({
    role:enemy?.role||null,
    skillKind:enemy?.combat3Skill?.kind||null,
    ready:(enemy?.combat3SkillCd||0)<=0,
    worldTierRank:engine?.worldTier?.rank||0,
    playerHpRatio:ratio(player.hp||0,player.maxHp||0),
    playerAtkBuffed:(player?.buffs?.atk?.turnsLeft||0)>0&&(player?.buffs?.atk?.mult||1)>1,
    playerAtkDebuffed:(player?.buffs?.atk?.turnsLeft||0)>0&&(player?.buffs?.atk?.mult||1)<1,
    playerSpdBuffed:(player?.buffs?.spd?.turnsLeft||0)>0&&(player?.buffs?.spd?.mult||1)>1,
    playerSpdDebuffed:(player?.buffs?.spd?.turnsLeft||0)>0&&(player?.buffs?.spd?.mult||1)<1,
    lowestAllyHpRatio:lowest?ratio(lowest.hp,lowest.maxHp):1,
    hasInjuredAlly:!!lowest,
  });
}

export function enemy3ShouldReserveSkill(ctx,currentReserved=false){
  if(!ctx?.ready)return false;
  const wt=enemy3WorldTierAiPolicy(ctx?.worldTierRank);
  switch(ctx.role){
    case 'attacker':
      return ctx.playerHpRatio<=wt.attackerExecuteHp?true:!!currentReserved;
    case 'caster':
      if(ctx.playerSpdDebuffed)return false;
      return (ctx.playerSpdBuffed||wt.proactiveDisruption)?true:!!currentReserved;
    case 'trickster':
      if(ctx.playerAtkDebuffed)return false;
      return (ctx.playerAtkBuffed||wt.proactiveDisruption)?true:!!currentReserved;
    case 'support':
      if(!ctx.hasInjuredAlly||ctx.lowestAllyHpRatio>=wt.supportHoldHealHp)return false;
      return ctx.lowestAllyHpRatio<=wt.supportForceHealHp?true:!!currentReserved;
    default:return !!currentReserved;
  }
}
