/* Enemy 2.0 E9 — curated endgame encounter profiles.
   Activity identity stays authoritative; this module only decorates generated stages. */
import { GLOBAL_ENEMY_SPECIES, materializeGlobalSpecies } from './globalEnemySpecies.js';

const BY_SPECIES=new Map(GLOBAL_ENEMY_SPECIES.map(s=>[s.speciesId,s]));
const TAG_GLOBALS=Object.freeze({
  fire:Object.freeze(['slime','lizard','golem','wisp']),
  ice:Object.freeze(['slime','wolf','wisp','golem']),
  lightning:Object.freeze(['slime','wisp','golem','lesser_spirit']),
  wind:Object.freeze(['slime','bat','wolf','lesser_spirit']),
  poison:Object.freeze(['slime','toxic_mushroom','lizard']),
  dark:Object.freeze(['slime','skeleton','bat','wandering_armor']),
  light:Object.freeze(['slime','lesser_spirit','wisp','golem']),
  abyss:Object.freeze(['slime','skeleton','wisp','wandering_armor']),
});

const ACTIVITY_TEMPLATES=Object.freeze({
  abyss:Object.freeze(['mixed','frontline','ambush','bulwark']),
  rift:Object.freeze(['mixed','pack','ambush','frontline']),
  secret:Object.freeze(['mixed','frontline','escort','ambush']),
  survey:Object.freeze(['mixed','frontline','escort','ambush','bulwark']),
});

function unique(xs){return [...new Set(xs.filter(Boolean))];}
function nonBossWaveTypes(stage,enemyTypes){return unique((stage?.waves||[]).map(w=>w?.type).filter(type=>enemyTypes?.[type]&&!enemyTypes[type].boss));}
function firstAnchor(stage,enemyTypes){return nonBossWaveTypes(stage,enemyTypes).map(id=>enemyTypes[id]).find(Boolean)||null;}
function roleAnchor(stage,enemyTypes,role){
  const ids=nonBossWaveTypes(stage,enemyTypes);
  return enemyTypes[ids.find(id=>enemyTypes[id]?.role===role)]||enemyTypes[ids[0]]||firstAnchor(stage,enemyTypes);
}

export function globalsForEndgameTags(tags=[],activity='secret',limit=3){
  const ids=[];
  if(activity==='abyss')ids.push(...TAG_GLOBALS.abyss);
  for(const tag of tags||[])ids.push(...(TAG_GLOBALS[tag]||[]));
  if(!ids.includes('slime'))ids.unshift('slime');
  return unique(ids).slice(0,Math.max(0,limit));
}

export function materializeEndgameGlobals(stage,enemyTypes,{activity='secret',limit=3}={}){
  const tags=activity==='abyss'?['abyss',...(stage?.dropRegionTags||[])]:[...(stage?.dropRegionTags||[])];
  const ids=[];
  for(const speciesId of globalsForEndgameTags(tags,activity,limit)){
    const species=BY_SPECIES.get(speciesId);if(!species)continue;
    const typeId=`e9_${activity}_${String(stage.id).replace(/[^a-zA-Z0-9_-]/g,'_')}_${speciesId}`;
    if(!enemyTypes[typeId]){
      const anchor=roleAnchor(stage,enemyTypes,species.role);
      const resolved=materializeGlobalSpecies(speciesId,anchor);
      if(resolved)enemyTypes[typeId]={...resolved,e9Endgame:true,e9Activity:activity};
    }
    if(enemyTypes[typeId])ids.push(typeId);
  }
  return ids;
}

function poolEntries(stage,enemyTypes,{activity,globalLimit,nativeWeight=1.1,globalWeight=.35}={}){
  const natives=nonBossWaveTypes(stage,enemyTypes).map(type=>({type,weight:nativeWeight}));
  const globals=materializeEndgameGlobals(stage,enemyTypes,{activity,limit:globalLimit}).map(type=>({type,weight:globalWeight}));
  return [...natives,...globals];
}

function decorate(stage,enemyTypes,{activity,globalLimit,templates,variantChance,regionTags,nativeWeight,globalWeight}={}){
  if(!stage)return stage;
  const types=poolEntries(stage,enemyTypes,{activity,globalLimit,nativeWeight,globalWeight});
  if(!types.length)return stage;
  stage.encounterPool={
    id:`${stage.id}-e9-${activity}`,
    types,
    templates:[...(templates||ACTIVITY_TEMPLATES[activity]||[])],
    rareChance:0,
    rareTypes:[],
    regionTags:[...(regionTags||stage.dropRegionTags||[])],
    variantChance:Math.max(0,Math.min(.75,Number(variantChance)||0)),
    e9Curated:true,
    activity,
  };
  return stage;
}

export function curateAbyssEncounterStage(stage,enemyTypes){
  if(!stage?.isAbyss)return stage;
  return decorate(stage,enemyTypes,{activity:'abyss',globalLimit:3,nativeWeight:1.35,globalWeight:.28,variantChance:.16,regionTags:['abyss']});
}

export function curateRiftEncounterStage(stage,enemyTypes){
  if(!stage?.isRift)return stage;
  const tags=[...(stage.dropRegionTags||[])];
  return decorate(stage,enemyTypes,{activity:'rift',globalLimit:3,nativeWeight:1.15,globalWeight:.48,variantChance:.58,regionTags:tags});
}

export function curateSecretRealmEncounterStage(stage,enemyTypes){
  if(!stage?.secretRealm||stage?.postCp3DeepSurvey||stage?.postCp3ConvergenceApex||stage?.convergenceApex)return stage;
  // Existing authored realm rares stay wave-authored; E9 adds no second Rare roll.
  return decorate(stage,enemyTypes,{activity:'secret',globalLimit:2,nativeWeight:1.35,globalWeight:.25,variantChance:.22,regionTags:[...(stage.dropRegionTags||[])]});
}

export function curateDeepSurveyEncounterStage(stage,enemyTypes){
  if(!stage?.postCp3DeepSurvey||stage?.postCp3ConvergenceApex||stage?.convergenceApex)return stage;
  return decorate(stage,enemyTypes,{activity:'survey',globalLimit:2,nativeWeight:1.45,globalWeight:.24,variantChance:.28,regionTags:[...(stage.dropRegionTags||[])]});
}

export function clearEncounterPoolForAuthoredApex(stage){
  if(stage?.postCp3ConvergenceApex||stage?.convergenceApex)delete stage.encounterPool;
  return stage;
}
