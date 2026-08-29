/* ============================================================
   Phase 10.1 — World Tier
   Post-story overworld difficulty that changes encounter pressure and rewards.
   Abyss keeps its own independent depth/pact/challenge scaling.
   ============================================================ */
export const WORLD_TIERS = Object.freeze([
  {id:'normal',rank:0,name:'World I — 境界安定',unlockLevel:1,enemyHp:1,enemyAtk:1,enemyDef:1,enemySpd:1,reward:1,drop:1,eliteChance:0,aiHaste:1,itemPowerBonus:0},
  {id:'awakened',rank:1,name:'World II — 覚醒世界',unlockLevel:3000,enemyHp:1.35,enemyAtk:1.18,enemyDef:1.12,enemySpd:1.05,reward:1.25,drop:1.18,eliteChance:.06,aiHaste:.92,itemPowerBonus:150},
  {id:'transcendent',rank:2,name:'World III — 超越世界',unlockLevel:9999,enemyHp:1.85,enemyAtk:1.38,enemyDef:1.25,enemySpd:1.10,reward:1.55,drop:1.35,eliteChance:.10,aiHaste:.84,itemPowerBonus:300},
  {id:'divine',rank:3,name:'World IV — 神域世界',unlockLevel:29999,enemyHp:2.65,enemyAtk:1.68,enemyDef:1.42,enemySpd:1.16,reward:2.00,drop:1.60,eliteChance:.15,aiHaste:.76,itemPowerBonus:500},
  {id:'cataclysm',rank:4,name:'World V — 終焉世界',unlockLevel:49999,enemyHp:3.75,enemyAtk:2.05,enemyDef:1.62,enemySpd:1.22,reward:2.65,drop:1.95,eliteChance:.21,aiHaste:.68,itemPowerBonus:750},
  {id:'boundary_zero',rank:5,name:'World VI — 境界零',unlockLevel:74999,enemyHp:5.25,enemyAtk:2.50,enemyDef:1.85,enemySpd:1.30,reward:3.50,drop:2.40,eliteChance:.28,aiHaste:.60,itemPowerBonus:1000},
  // World VII extends the same per-step growth World V->VI already used for
  // enemyHp/enemyAtk/enemyDef/enemySpd/eliteChance (e.g. aiHaste keeps the
  // exact 1-0.08*rank formula every prior tier already followed) rather than
  // inventing a new curve. unlockLevel sits at the existing Lv99,999
  // character-level cap. reward/drop/itemPowerBonus are NOT independently
  // extrapolated -- they must equal endgameRewardScaling.js's existing
  // Lv99,999 milestone (drop:2.80, gold:4.25, itemPowerBonus:1250), since
  // that shared curve already governs World Tier/Abyss/Bounty/Machine World
  // rewards at every unlockLevel (see tests/phase10-3-endgame-reward-scaling.test.js).
  {id:'beyond_boundary',rank:6,name:'World VII — 零界外縁',unlockLevel:99999,enemyHp:7.35,enemyAtk:3.05,enemyDef:2.11,enemySpd:1.38,reward:4.25,drop:2.80,eliteChance:.35,aiHaste:.52,itemPowerBonus:1250},
]);

export function worldTier(id){return WORLD_TIERS.find(t=>t.id===id)||WORLD_TIERS[0];}
export function unlockedWorldTiers(level){const lv=Math.max(1,Number(level)||1);return WORLD_TIERS.filter(t=>lv>=t.unlockLevel);}
export function highestWorldTier(level){return unlockedWorldTiers(level).at(-1)||WORLD_TIERS[0];}
