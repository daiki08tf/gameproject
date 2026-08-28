/* Enemy 2.0 E7 — generic rank, Rare and environmental Variant contracts. */
import { clampEnemyLevel, stageEnemyBaseLevel, ENEMY_LEVEL_SCALE_EXPONENTS } from './enemyLevel.js';
import { weightedEncounterPick } from './encounterPools2.js';

export const ENEMY_RANK_LEVEL_BANDS=Object.freeze({
  rare:Object.freeze({min:1.15,max:1.35}),
  elite:Object.freeze({min:1.20,max:1.45}),
});

export const GENERIC_ELITE_MULT=Object.freeze({hp:1.25,atk:1.12,def:1.08,xp:1.25,gold:1.25});

export const ENVIRONMENT_VARIANTS=Object.freeze({
  grassland_windswept:Object.freeze({
    id:'grassland_windswept',name:'風渡り',requiredTags:Object.freeze(['grassland']),
    roles:Object.freeze(['normal','fast','attacker']),
    statMult:Object.freeze({hp:1.00,atk:1.04,def:1.00,spd:1.06,xp:1.03,gold:1.03}),
  }),
});

const boundedRoll=rng=>Math.max(0,Math.min(.999999999,Number(rng?.())||0));

export function rankLevelFor(stage,rank,rng=Math.random){
  const band=ENEMY_RANK_LEVEL_BANDS[rank];
  const base=stageEnemyBaseLevel(stage);
  if(!band)return base;
  return clampEnemyLevel(base*(band.min+(band.max-band.min)*boundedRoll(rng)));
}

export function retargetEnemyLevelForRank(enemy,stage,rank,rng=Math.random){
  if(!enemy||enemy.boss||!ENEMY_RANK_LEVEL_BANDS[rank])return enemy;
  const current=clampEnemyLevel(enemy.level??enemy.baseLevel??stageEnemyBaseLevel(stage));
  const next=rankLevelFor(stage,rank,rng);
  const ratio=Math.max(.000001,next/current);
  for(const key of ['hp','atk','def','spd','xp','gold']){
    if(!Number.isFinite(enemy[key]))continue;
    const exp=ENEMY_LEVEL_SCALE_EXPONENTS[key]??1;
    const floor=(key==='def'||key==='gold')?0:1;
    enemy[key]=Math.max(floor,Math.round(enemy[key]*Math.pow(ratio,exp)));
  }
  enemy.level=next;
  enemy.baseLevel=stageEnemyBaseLevel(stage);
  enemy.maxHp=enemy.hp;
  return enemy;
}

export function markGenericElite(enemy){
  if(!enemy||enemy.boss||enemy.elite||enemy.rareIdentity)return enemy;
  enemy.rank='elite';
  enemy.genericElite=true;
  // `enemy.elite` remains reserved for historical Abyss reward-eligible elites.
  for(const key of ['hp','atk','def','xp','gold']){
    if(!Number.isFinite(enemy[key]))continue;
    const floor=(key==='def'||key==='gold')?0:1;
    enemy[key]=Math.max(floor,Math.round(enemy[key]*(GENERIC_ELITE_MULT[key]||1)));
  }
  enemy.maxHp=enemy.hp;
  return enemy;
}

export function markRare(enemy,stage,rng=Math.random){
  if(!enemy||enemy.boss||!enemy.rareIdentity)return enemy;
  enemy.rank='rare';
  enemy.rare=true;
  return retargetEnemyLevelForRank(enemy,stage,'rare',rng);
}

export function finalizeGenericEliteLevel(enemy,stage,rng=Math.random){
  if(!enemy?.genericElite||enemy.boss||enemy.elite)return enemy;
  enemy.rank='elite';
  return retargetEnemyLevelForRank(enemy,stage,'elite',rng);
}

export function rareChanceFor(pool,tier){
  const base=Math.max(0,Number(pool?.rareChance)||0);
  const tierRank=Math.max(0,Math.floor(Number(tier?.rank)||0));
  return Math.min(.08,base+tierRank*.004);
}

export function planRareOverrideTypes(stage,spec,enemyTypes,tier,rng=Math.random){
  const pool=stage?.encounterPool;
  const template=enemyTypes?.[spec?.type];
  const count=Math.max(0,Math.floor(Number(spec?.count)||0));
  if(!pool||!count||template?.boss||boundedRoll(rng)>=rareChanceFor(pool,tier))return null;
  const rareEntries=(pool.rareTypes||[]).filter(entry=>enemyTypes?.[entry?.type]?.rareIdentity&&!enemyTypes?.[entry?.type]?.boss);
  const rareType=weightedEncounterPick(rareEntries,rng);
  if(!rareType)return null;
  const overrides=Array(count).fill(null);
  overrides[Math.min(count-1,Math.floor(boundedRoll(rng)*count))]=rareType;
  return overrides;
}

export function chooseEnvironmentalVariant(pool,enemy,rng=Math.random){
  if(!pool||!enemy||enemy.boss||enemy.rareIdentity||boundedRoll(rng)>=Math.max(0,Number(pool.variantChance)||0))return null;
  const tags=new Set(pool.regionTags||[]);
  const candidates=Object.values(ENVIRONMENT_VARIANTS).filter(v=>
    v.requiredTags.every(tag=>tags.has(tag))&&(!v.roles.length||v.roles.includes(enemy.role))
  );
  if(!candidates.length)return null;
  return candidates[Math.min(candidates.length-1,Math.floor(boundedRoll(rng)*candidates.length))];
}

export function applyEnvironmentalVariant(enemy,variant){
  if(!enemy||!variant||enemy.boss)return enemy;
  enemy.variantId=variant.id;
  enemy.variantName=variant.name;
  enemy.name=`${variant.name}${enemy.name}`;
  for(const key of ['hp','atk','def','spd','xp','gold']){
    if(!Number.isFinite(enemy[key]))continue;
    const floor=(key==='def'||key==='gold')?0:1;
    enemy[key]=Math.max(floor,Math.round(enemy[key]*(variant.statMult?.[key]||1)));
  }
  enemy.maxHp=enemy.hp;
  return enemy;
}
