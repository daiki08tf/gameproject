/* Core Loop Rework — CLR-5
   World Tier may increase expedition length, but never owns reward multipliers.
   Existing World Tier / endgame reward authorities remain canonical. */

export function adventure4Clr5CadenceProfile(worldTierRank=0){
  const rank=Math.max(0,Math.floor(Number(worldTierRank)||0));
  if(rank>=4)return Object.freeze({rank,pressureBattles:8,steadyBattles:7,label:'高圧長期遠征'});
  if(rank>=2)return Object.freeze({rank,pressureBattles:7,steadyBattles:6,label:'高圧遠征'});
  return Object.freeze({rank,pressureBattles:6,steadyBattles:5,label:'標準遠征'});
}
