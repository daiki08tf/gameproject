/* Abyss 2.0 — player-selected risk/reward pacts */
export const ABYSS_PACTS = Object.freeze([
  { id:'blood', name:'血盟', desc:'敵HP+35% / 欠片+25%', enemyHpMult:1.35, shardMult:1.25, danger:1 },
  { id:'wrath', name:'憤怒盟約', desc:'敵ATK+30% / Gold+35%', enemyAtkMult:1.30, goldMult:1.35, danger:1 },
  { id:'haste', name:'迅速盟約', desc:'敵SPD+25% / EXP+30%', enemySpeedMult:1.25, expMult:1.30, danger:1 },
  { id:'scarcity', name:'枯渇盟約', desc:'回復量-40% / Drop+45%', healMult:0.60, dropMult:1.45, danger:2 },
  { id:'iron', name:'鉄獄盟約', desc:'敵DEF+40% / 欠片+40%', enemyDefMult:1.40, shardMult:1.40, danger:2 },
  { id:'cataclysm', name:'終末盟約', desc:'敵HP/ATK+25% / 全報酬+35%', enemyHpMult:1.25, enemyAtkMult:1.25, goldMult:1.35, expMult:1.35, dropMult:1.35, shardMult:1.35, danger:3 },
]);

export function abyssPact(id){ return ABYSS_PACTS.find(p=>p.id===id)||null; }
export function abyssPactDanger(ids=[]){ return [...new Set(ids)].reduce((n,id)=>n+(abyssPact(id)?.danger||0),0); }
export function abyssPactMultiplier(ids=[], key){ return [...new Set(ids)].reduce((m,id)=>m*(abyssPact(id)?.[key]||1),1); }
export function maxAbyssPactsForDepth(depth){ return depth>=1000?3:depth>=250?2:1; }
