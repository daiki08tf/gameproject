/* Enemy 2.0 E8 — progressive Ch1–32 Encounter Pool migration profiles. */
import { GLOBAL_ENEMY_SPECIES, materializeGlobalSpecies } from './globalEnemySpecies.js';

export const E8_TEMPLATE_IDS=Object.freeze(['mixed','pack','frontline','escort','ambush','bulwark']);

const ELEMENT_GLOBALS=Object.freeze({
  fire:Object.freeze(['lizard','golem','wisp']),
  ice:Object.freeze(['wolf','wisp','golem']),
  wind:Object.freeze(['bat','wolf','lesser_spirit']),
  poison:Object.freeze(['toxic_mushroom','lizard','slime']),
  dark:Object.freeze(['skeleton','bat','wandering_armor']),
  light:Object.freeze(['lesser_spirit','wisp','golem']),
});

const ROLE_WEIGHTS=Object.freeze({
  normal:1.20,fast:1.00,tank:.75,attacker:1.00,caster:.75,trickster:.70,support:.60,
});

const speciesById=new Map(GLOBAL_ENEMY_SPECIES.map(s=>[s.speciesId,s]));

function regionalTypeId(chapterId,role){
  if(chapterId==='ch1'){
    return {normal:'grunt',fast:'fast',tank:'tank',attacker:'ch1_attacker',caster:'ch1_caster',trickster:'ch1_trickster',support:'ch1_support'}[role]||null;
  }
  return `${chapterId}_${role}`;
}

function globalAnchorId(chapterId,role){
  return regionalTypeId(chapterId,role)||regionalTypeId(chapterId,'normal');
}

function encounterRegionTags(chapter){
  const tags=[...(chapter?.stages?.[0]?.dropRegionTags||[])];
  if(chapter?.id==='ch1'&&!tags.includes('grassland'))tags.push('grassland');
  return tags;
}

export function globalRosterForRegionTags(tags=[],chapterId=''){
  if(chapterId==='ch1')return ['slime','wolf','goblin'];
  const out=['slime'];
  for(const tag of tags||[]){
    for(const id of ELEMENT_GLOBALS[tag]||[]){if(!out.includes(id))out.push(id);}
  }
  // Keep regional identity stronger than the global layer.
  return out.slice(0,4);
}

export function registerChapterGlobalEnemies(chapter,enemyTypes){
  const tags=encounterRegionTags(chapter);
  const roster=globalRosterForRegionTags(tags,chapter?.id);
  const ids=[];
  for(const speciesId of roster){
    const species=speciesById.get(speciesId);
    if(!species)continue;
    const typeId=`e8_${chapter.id}_global_${speciesId}`;
    if(!enemyTypes[typeId]){
      const anchor=enemyTypes[globalAnchorId(chapter.id,species.role)];
      const materialized=materializeGlobalSpecies(speciesId,anchor);
      if(materialized)enemyTypes[typeId]={...materialized,chapterId:chapter.id,e8Global:true};
    }
    if(enemyTypes[typeId])ids.push(typeId);
  }
  return ids;
}

export function buildChapterEncounterPool(chapter,enemyTypes){
  const regional=[];
  for(const role of Object.keys(ROLE_WEIGHTS)){
    const type=regionalTypeId(chapter.id,role);
    if(enemyTypes[type])regional.push({type,weight:ROLE_WEIGHTS[role]});
  }
  const globals=registerChapterGlobalEnemies(chapter,enemyTypes).map(type=>{
    const species=speciesById.get(enemyTypes[type]?.speciesId);
    return {type,weight:Math.max(.35,Math.min(.65,(species?.spawnWeight||.5)*.50))};
  });
  return {
    id:`${chapter.id}-e8-field`,
    types:[...regional,...globals],
    templates:[...E8_TEMPLATE_IDS],
    rareChance:.04,
    rareTypes:[{type:`${chapter.id}_rare`,weight:1}],
    regionTags:encounterRegionTags(chapter),
    variantChance:.10,
  };
}

export function isE8MigratableStage(chapter,stage){
  if(!chapter||!stage||stage.isAbyss||stage.branch)return false;
  // Keep the original onboarding fight deterministic.
  if(stage.id==='1-1')return false;
  return true;
}

export function migrateStoryEncounterPools(chapters,enemyTypes){
  const migrated=[];
  for(const chapter of chapters||[]){
    if(!chapter||chapter.num<1||chapter.num>32)continue;
    const basePool=buildChapterEncounterPool(chapter,enemyTypes);
    for(const stage of chapter.stages||[]){
      if(!isE8MigratableStage(chapter,stage))continue;
      stage.encounterPool={
        ...basePool,
        types:basePool.types.map(x=>({...x})),
        templates:[...basePool.templates],
        rareTypes:basePool.rareTypes.filter(x=>enemyTypes[x.type]).map(x=>({...x})),
        regionTags:[...basePool.regionTags],
      };
      migrated.push(stage.id);
    }
  }
  return migrated;
}
