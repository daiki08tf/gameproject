/* Enemy 3.0 B2 — deterministic tactical reservation policy for advanced roles. */

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
  switch(ctx.role){
    case 'attacker':
      // Preserve the existing random reservation normally; become decisive when
      // the player is close to defeat instead of adding a new execution mechanic.
      return ctx.playerHpRatio<=.35?true:!!currentReserved;
    case 'caster':
      // Do not waste slow while an equivalent slow is already active. Punish
      // player SPD setup by prioritising the existing slow spell.
      if(ctx.playerSpdDebuffed)return false;
      return ctx.playerSpdBuffed?true:!!currentReserved;
    case 'trickster':
      // Same contract for ATK disruption: avoid redundant refreshes, but react
      // immediately to an active offensive buff.
      if(ctx.playerAtkDebuffed)return false;
      return ctx.playerAtkBuffed?true:!!currentReserved;
    case 'support':
      // Existing Combat 3 already picks the lowest-HP ally. B2 only decides
      // whether healing is worth reserving; it never creates a second targeter.
      if(!ctx.hasInjuredAlly||ctx.lowestAllyHpRatio>=.70)return false;
      return ctx.lowestAllyHpRatio<=.40?true:!!currentReserved;
    default:return !!currentReserved;
  }
}
