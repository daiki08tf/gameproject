/* Enemy 3.0 B9 — World Tier changes tactical decisions, not raw stats.
   World VII (rank 6) extends every threshold table below by exactly one more
   step of that table's own existing progression (e.g. +.02 for the .02-step
   tables, +.025 for the synergy table) rather than introducing a new curve. */
const clampRank=value=>Math.max(0,Math.min(6,Math.floor(Number(value)||0)));
const ATTACKER_EXECUTE_HP=Object.freeze([.35,.37,.39,.41,.43,.45,.47]);
const SUPPORT_FORCE_HEAL_HP=Object.freeze([.40,.42,.44,.46,.48,.50,.52]);
const SUPPORT_HOLD_HEAL_HP=Object.freeze([.70,.72,.74,.76,.78,.80,.82]);
const SYNERGY_TRIAGE_HP=Object.freeze([.55,.575,.60,.625,.65,.675,.70]);

export function enemy3WorldTierRank(source){
  if(Number.isFinite(source))return clampRank(source);
  if(Number.isFinite(source?.rank))return clampRank(source.rank);
  if(Number.isFinite(source?.worldTier?.rank))return clampRank(source.worldTier.rank);
  return 0;
}

export function enemy3WorldTierAiPolicy(source){
  const rank=enemy3WorldTierRank(source);
  return Object.freeze({
    rank,
    attackerExecuteHp:ATTACKER_EXECUTE_HP[rank],
    supportForceHealHp:SUPPORT_FORCE_HEAL_HP[rank],
    supportHoldHealHp:SUPPORT_HOLD_HEAL_HP[rank],
    synergyTriageHp:SYNERGY_TRIAGE_HP[rank],
    proactiveDisruption:rank>=4,
  });
}
