/* Enemy 3.0 B9 — World Tier changes tactical decisions, not raw stats. */
const clampRank=value=>Math.max(0,Math.min(5,Math.floor(Number(value)||0)));

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
    attackerExecuteHp:.35+rank*.02,
    supportForceHealHp:.40+rank*.02,
    supportHoldHealHp:.70+rank*.02,
    synergyTriageHp:.55+rank*.025,
    proactiveDisruption:rank>=4,
  });
}
