/* Enemy 3.0 B6/B9 — bounded encounter-level role synergy. */
import { enemy3WorldTierAiPolicy } from './enemy3WorldTierAI.js';
const hpRatio=e=>e?.maxHp>0?Math.max(0,e.hp/e.maxHp):1;
const roleId=e=>e?.combat3Role?.id||e?.role||null;
const isSpecial=e=>!!(e?.boss||e?.elite||e?.rare||e?.rareIdentity);

export function enemy3SynergyContext(engine,enemy){
  const alive=(engine?.aliveEnemies||[]).filter(e=>e&&!e.dead);
  const allies=alive.filter(e=>e!==enemy&&!isSpecial(e));
  const ownRole=roleId(enemy);
  const hasGuardian=allies.some(e=>roleId(e)==='guardian');
  const protectedBackliner=allies.find(e=>['caster','support'].includes(roleId(e))||['caster','support','trickster'].includes(e.role));
  const woundedAlly=allies.filter(e=>hpRatio(e)<1).sort((a,b)=>hpRatio(a)-hpRatio(b))[0]||null;
  const species=enemy?.speciesId||null;
  const sameSpecies=species?alive.filter(e=>!isSpecial(e)&&e.speciesId===species).length:0;
  return {alive,allies,ownRole,hasGuardian,protectedBackliner,woundedAlly,sameSpecies};
}

export function enemy3SynergyShouldReserveSkill(engine,enemy,current=false){
  if(!enemy||enemy.dead||isSpecial(enemy))return current;
  const skill=enemy.combat3Skill;
  if(!skill||(enemy.combat3SkillCd||0)>1)return current;
  const ctx=enemy3SynergyContext(engine,enemy);
  const wt=enemy3WorldTierAiPolicy(engine?.worldTier);

  if(skill.kind==='guardAll'&&ctx.protectedBackliner){
    const uncovered=ctx.protectedBackliner?.combat3Buffs?.def?.turns<=0||!ctx.protectedBackliner?.combat3Buffs?.def;
    if(uncovered)return true;
  }
  if(skill.kind==='healAlly'&&ctx.woundedAlly&&hpRatio(ctx.woundedAlly)<=wt.synergyTriageHp)return true;
  return current;
}

export function enemy3SynergyStatMultiplier(engine,enemy,stat){
  if(!enemy||enemy.dead||isSpecial(enemy))return 1;
  const ctx=enemy3SynergyContext(engine,enemy);
  let mult=1;

  // A guardian creates a safe screen for offensive/backline roles.
  if(ctx.hasGuardian&&stat==='atk'&&enemy.role==='attacker')mult*=1.06;
  if(ctx.hasGuardian&&stat==='spd'&&['caster','trickster'].includes(enemy.role))mult*=1.06;

  // Two or more materialized members of the same species exert mild pack pressure.
  if(stat==='atk'&&ctx.sameSpecies>=2)mult*=1.04;
  return Math.min(1.10,mult);
}
