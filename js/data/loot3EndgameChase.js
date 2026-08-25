/* Loot 3.0 — Endgame chase tiers (NOT equipment rarities) */

function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}

export const LOOT3_CHASE_TIERS=Object.freeze([
  Object.freeze({id:'endgame',label:'ENDGAME PIECE',minIp:7000,minScore:3}),
  Object.freeze({id:'apex',label:'APEX DROP',minIp:8500,minScore:6}),
  Object.freeze({id:'godroll',label:'GOD ROLL',minIp:9500,minScore:9}),
]);

export function loot3EndgameChase(item,presentation){
  const p=presentation;
  if(!item||!p||p.itemPower==null)return {tier:null,score:0,signals:[],progress:0};
  const signals=[];
  let score=0;
  const ip=Math.max(0,Number(p.itemPower)||0);
  if(ip>=9500){score+=3;signals.push('IP9500+');}
  else if(ip>=8500){score+=2;signals.push('IP8500+');}
  else if(ip>=7000){score+=1;signals.push('IP7000+');}
  if(item.rarity==='mythic'){score+=1;signals.push('MYTHIC BASE');}
  if(p.highestAffixRarity==='ancient'){score+=3;signals.push('ANCIENT');}
  else if(p.highestAffixRarity==='mythic'){score+=2;signals.push('MYTHIC AFFIX');}
  else if(p.highestAffixRarity==='legendary'){score+=1;signals.push('LEGENDARY AFFIX');}
  if((p.buildCount||0)>0){score+=Math.min(3,p.buildCount*2);signals.push(p.buildCount>1?`BUILD×${p.buildCount}`:'BUILD');}
  if((p.greaterCount||0)>=2){score+=3;signals.push(`GREATER×${p.greaterCount}`);}
  else if((p.greaterCount||0)===1){score+=1;signals.push('GREATER');}
  if(p.legendary){score+=2;signals.push('LEGENDARY POWER');}
  if(p.targetFarmHit){score+=1;signals.push('TARGET HIT');}
  if(item.setId||item.setName){score+=1;signals.push('SET');}

  let tier=null;
  for(const def of LOOT3_CHASE_TIERS){if(ip>=def.minIp&&score>=def.minScore)tier=def;}
  // GOD ROLL must combine roll quality with a build-defining axis; raw IP alone is insufficient.
  if(tier?.id==='godroll' && !(p.highestAffixRarity==='ancient' && ((p.buildCount||0)>0||p.legendary) && (p.greaterCount||0)>=1)) {
    tier=LOOT3_CHASE_TIERS.find(t=>t.id==='apex');
  }
  const next=LOOT3_CHASE_TIERS.find(t=>!tier||LOOT3_CHASE_TIERS.indexOf(t)>LOOT3_CHASE_TIERS.indexOf(tier))||null;
  const progress=next?clamp(score/next.minScore,0,1):1;
  return {tier,score,signals,progress,next};
}
