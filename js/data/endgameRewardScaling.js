/* Phase 10.3 — unified endgame reward / loot scaling.
   This curve is shared by World Tier-equivalent content, Abyss, EX Bounties and Machine World.
   EXP progression remains owned by the Abyss roadmap; this module mainly prevents loot/gold
   chase value from flattening while character level and target Item Power keep climbing. */

export const ENDGAME_REWARD_MILESTONES=Object.freeze([
  {level:1,drop:1.00,gold:1.00,itemPowerBonus:0,label:'通常域'},
  {level:3000,drop:1.18,gold:1.25,itemPowerBonus:150,label:'覚醒帯'},
  {level:9999,drop:1.35,gold:1.55,itemPowerBonus:300,label:'超越帯'},
  {level:29999,drop:1.60,gold:2.00,itemPowerBonus:500,label:'神域帯'},
  {level:49999,drop:1.95,gold:2.65,itemPowerBonus:750,label:'終焉帯'},
  {level:74999,drop:2.40,gold:3.50,itemPowerBonus:1000,label:'境界零帯'},
  {level:99999,drop:2.80,gold:4.25,itemPowerBonus:1250,label:'極限帯'},
]);

function clampLevel(level){return Math.max(1,Math.min(99999,Math.floor(Number(level)||1)));}
function lerp(a,b,t){return a+(b-a)*t;}

export function endgameRewardProfile(level){
  const lv=clampLevel(level);
  let lo=ENDGAME_REWARD_MILESTONES[0],hi=ENDGAME_REWARD_MILESTONES.at(-1);
  for(let i=1;i<ENDGAME_REWARD_MILESTONES.length;i++){
    hi=ENDGAME_REWARD_MILESTONES[i];lo=ENDGAME_REWARD_MILESTONES[i-1];
    if(lv<=hi.level)break;
  }
  if(lv<=lo.level)return{...lo,level:lv};
  if(lv>=hi.level)return{...hi,level:lv};
  const t=(lv-lo.level)/(hi.level-lo.level);
  return{
    level:lv,
    drop:Number(lerp(lo.drop,hi.drop,t).toFixed(3)),
    gold:Number(lerp(lo.gold,hi.gold,t).toFixed(3)),
    itemPowerBonus:Math.round(lerp(lo.itemPowerBonus,hi.itemPowerBonus,t)),
    label:lo.label,
  };
}

export function endgameBossRewardMult({boss=false,secretBoss=false,nemesisLevel=0}={}){
  let mult=boss?1.18:1;
  if(secretBoss)mult*=1.35;
  if(nemesisLevel>0)mult*=1+Math.min(.75,nemesisLevel*.05);
  return Number(mult.toFixed(3));
}
