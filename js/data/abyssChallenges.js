/* Abyss 3.0 — stackable player-selected challenge modifiers.
   Pacts remain the broad risk/reward layer; challenges are granular clauses
   that can be stacked to deliberately push a run beyond its normal danger. */
export const ABYSS_CHALLENGES = Object.freeze([
  { id:'vitality', name:'生命増幅', icon:'🫀', desc:'敵HP+30% / Drop+10%', enemyHpMult:1.30, dropMult:1.10, danger:1 },
  { id:'onslaught', name:'猛攻', icon:'⚔️', desc:'敵ATK+40% / Greater出現率+15%', enemyAtkMult:1.40, greaterBonus:0.15, danger:2 },
  { id:'drought', name:'癒しなき深淵', icon:'🩸', desc:'回復量-50% / Legendary出現率+15%', healMult:0.50, legendaryBonus:0.15, danger:2 },
  { id:'elite_horde', name:'精鋭招来', icon:'👁️', desc:'Elite脅威+2 / Set出現率+30%', eliteBonus:2, setBonus:0.30, danger:3 },
  { id:'boss_technique', name:'覇者の秘技', icon:'☠️', desc:'Boss固有技+1 / 特殊報酬判定を追加', bossTechniqueBonus:1, specialReward:true, danger:4 },
]);

export function abyssChallenge(id){ return ABYSS_CHALLENGES.find(x=>x.id===id)||null; }
export function abyssChallengeDanger(ids=[]){ return [...new Set(ids)].reduce((n,id)=>n+(abyssChallenge(id)?.danger||0),0); }
export function abyssChallengeMultiplier(ids=[],key){ return [...new Set(ids)].reduce((m,id)=>m*(abyssChallenge(id)?.[key]||1),1); }
export function abyssChallengeAdditive(ids=[],key){ return [...new Set(ids)].reduce((n,id)=>n+(abyssChallenge(id)?.[key]||0),0); }
export function abyssChallengeFlags(ids=[]){
  const unique=[...new Set(ids)].filter(id=>abyssChallenge(id));
  return {
    greaterBonus:abyssChallengeAdditive(unique,'greaterBonus'),
    legendaryBonus:abyssChallengeAdditive(unique,'legendaryBonus'),
    setBonus:abyssChallengeAdditive(unique,'setBonus'),
    eliteBonus:abyssChallengeAdditive(unique,'eliteBonus'),
    bossTechniqueBonus:abyssChallengeAdditive(unique,'bossTechniqueBonus'),
    specialReward:unique.some(id=>abyssChallenge(id)?.specialReward),
  };
}
