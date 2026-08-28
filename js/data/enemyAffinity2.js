/* Enemy Affinity / Weakness 2.0 — bounded species/family/variant elemental profiles. */

export const ENEMY_AFFINITY_ELEMENTS=Object.freeze(['fire','ice','lightning','wind','light','dark','poison','bleed']);

export const ENEMY_AFFINITY_FAMILIES=Object.freeze({
  slime:Object.freeze({name:'スライム系',resist:Object.freeze({fire:-.20,poison:.20})}),
  beast:Object.freeze({name:'獣系',resist:Object.freeze({fire:-.10,poison:-.08})}),
  plant:Object.freeze({name:'植物系',resist:Object.freeze({fire:-.30,poison:.25})}),
  undead:Object.freeze({name:'不死系',resist:Object.freeze({light:-.30,dark:.25,poison:.30,bleed:.30})}),
  construct:Object.freeze({name:'機械・無機系',resist:Object.freeze({lightning:-.25,poison:.35,bleed:.35})}),
  demon:Object.freeze({name:'魔族系',resist:Object.freeze({light:-.25,dark:.25,fire:.10})}),
  spirit:Object.freeze({name:'霊体系',resist:Object.freeze({dark:-.20,light:.15,poison:.25,bleed:.25})}),
  dragon:Object.freeze({name:'竜系',resist:Object.freeze({ice:-.18,fire:.18,poison:.10})}),
});

export const ENEMY_AFFINITY_VARIANTS=Object.freeze({
  grassland_windswept:Object.freeze({wind:.12,ice:-.08}),
  fire_ash:Object.freeze({fire:.22,ice:-.18}),
  ice_frost:Object.freeze({ice:.22,fire:-.22}),
  lightning_arc:Object.freeze({lightning:.22,wind:-.10}),
  wind_gale:Object.freeze({wind:.22,ice:-.18}),
  poison_mire:Object.freeze({poison:.28,fire:-.12}),
  dark_umbral:Object.freeze({dark:.22,light:-.22}),
  light_radiant:Object.freeze({light:.22,dark:-.22}),
  abyss_echo:Object.freeze({dark:.12,light:-.12}),
});

const SPECIES_FAMILY=Object.freeze({
  slime:'slime',bat:'beast',goblin:null,wolf:'beast',skeleton:'undead',golem:'construct',wisp:'spirit',
  toxic_mushroom:'plant',lesser_spirit:'spirit',lizard:'beast',mimic:'construct',wandering_armor:'construct',
});

const NAME_RULES=Object.freeze([
  Object.freeze({family:'slime',re:/スライム/}),
  Object.freeze({family:'dragon',re:/竜|ドラゴン|ヒュドラ|クラーケン/}),
  Object.freeze({family:'undead',re:/骨|亡将|亡者|墓|骸|スケルトン/}),
  Object.freeze({family:'construct',re:/機兵|機械|砲台|ドローン|端末|演算|修復|監査|装甲|鎧|ミミック/}),
  Object.freeze({family:'plant',re:/キノコ|茸|花|樹|胞子|根脈/}),
  Object.freeze({family:'demon',re:/デーモン|魔界|魔王|奈落|悪魔/}),
  Object.freeze({family:'spirit',re:/精霊|霊体|ウィスプ|共鳴体/}),
  Object.freeze({family:'beast',re:/狼|獣|牙|グリフォン|ペガサス|イエティ|鳥|コウモリ/}),
]);

function clampResist(v){return Math.max(-.45,Math.min(.35,Number(v)||0));}

export function enemyAffinityFamily(enemy={}){
  if(enemy.affinityFamily&&ENEMY_AFFINITY_FAMILIES[enemy.affinityFamily])return enemy.affinityFamily;
  const speciesMapped=SPECIES_FAMILY[enemy.speciesId];
  if(speciesMapped&&ENEMY_AFFINITY_FAMILIES[speciesMapped])return speciesMapped;
  if(enemy.speciesFamily&&ENEMY_AFFINITY_FAMILIES[enemy.speciesFamily])return enemy.speciesFamily;
  const name=String(enemy.baseName||enemy.name||'');
  for(const rule of NAME_RULES)if(rule.re.test(name))return rule.family;
  return null;
}

export function enemyAffinityProfile(enemy={}){
  const family=enemyAffinityFamily(enemy);
  const result={};
  const familyMap=ENEMY_AFFINITY_FAMILIES[family]?.resist||{};
  for(const [element,value] of Object.entries(familyMap))result[element]=clampResist(value);
  const variantMap=ENEMY_AFFINITY_VARIANTS[enemy.variantId]||{};
  for(const [element,value] of Object.entries(variantMap))result[element]=clampResist((result[element]||0)+value);
  for(const [element,value] of Object.entries(enemy.elementResist||{})){
    if(Number.isFinite(value))result[element]=clampResist(value);
  }
  return {family,familyName:ENEMY_AFFINITY_FAMILIES[family]?.name||null,resist:result};
}

export function enemyAffinityResist(enemy,element){
  const value=enemyAffinityProfile(enemy).resist?.[element];
  return Number.isFinite(value)?value:null;
}

export function affinityMultiplierFromResist(resist){
  if(!Number.isFinite(resist))return 1;
  return Math.max(.65,Math.min(1.55,1-resist));
}

export function affinityTier(mult){
  const n=Number(mult)||1;
  if(n>=1.30)return'weakMajor';
  if(n>=1.12)return'weak';
  if(n<=.72)return'resistMajor';
  if(n<=.90)return'resist';
  return'neutral';
}

export function affinityTierLabel(tier){
  return {weakMajor:'大弱点',weak:'弱点',resistMajor:'強耐性',resist:'耐性',neutral:'等倍'}[tier]||'等倍';
}
