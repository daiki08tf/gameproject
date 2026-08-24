/* Blade Vale — Loot 2.0: jackpot classification + salvage economy */
export const LOOT2_TIERS=Object.freeze({
 standard:{id:'standard',name:'通常個体',rank:0},
 ancient:{id:'ancient',name:'Ancient',rank:1},
 primordial:{id:'primordial',name:'Primordial',rank:2},
});
export function loot2Tier(instance={}){const ip=Math.max(0,Number(instance.itemPower)||0),greater=Math.max(0,Number(instance.greaterAffixCount)||0),affixes=Array.isArray(instance.affixes)?instance.affixes.length:0,legendary=!!instance.legendaryEffectId,cursed=!!instance.curseId;if(ip>=9500&&greater>=3&&legendary&&affixes>=4)return LOOT2_TIERS.primordial;if(ip>=8000&&((greater>=2&&affixes>=4)||legendary||(cursed&&greater>=1)))return LOOT2_TIERS.ancient;return LOOT2_TIERS.standard;}
export function loot2Score(instance={}){const ip=Math.max(0,Number(instance.itemPower)||0),greater=Math.max(0,Number(instance.greaterAffixCount)||0),affixes=Array.isArray(instance.affixes)?instance.affixes.length:0;return Math.round(ip/10+greater*180+affixes*35+(instance.legendaryEffectId?280:0)+(instance.curseId?90:0));}
export function salvageYield(instance={}){const ip=Math.max(1,Number(instance.itemPower)||1),tier=loot2Tier(instance),greater=Math.max(0,Number(instance.greaterAffixCount)||0);const essence=Math.max(1,Math.round(1+ip/900+greater*2+tier.rank*7));const manastone=tier.rank>=2?5:tier.rank===1?2:ip>=3000?1:0;return{essence,manastone};}
export function loot2Presentation(instance={}){const tier=loot2Tier(instance);return{tier,score:loot2Score(instance),jackpot:tier.rank>0,label:tier.rank>0?`${tier.name} / SCORE ${loot2Score(instance)}`:`SCORE ${loot2Score(instance)}`};}
