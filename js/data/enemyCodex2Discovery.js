/* Enemy 2.0 E10 — ecology discovery aggregation inside the existing monsterCodex save root. */
import { globalEnemySpecies } from './globalEnemySpecies.js';

export const ENEMY2_ECOLOGY_KEY='__enemy2Ecology';

export const ENEMY2_ACTIVITY_LABELS=Object.freeze({
  story:'Story',abyss:'Abyss',rift:'Rift',secret:'Secret Realm',survey:'Deep Survey',
});

export function isEnemy2GeneratedMaterializationId(id){return /^e[89]_/.test(String(id||''));}

function addUnique(list,value){if(value&&!list.includes(value))list.push(value);}
function cleanList(value){return Array.isArray(value)?value:[];}
function safeLevel(enemy){const n=Number(enemy?.level??enemy?.baseLevel);return Number.isFinite(n)?Math.max(1,Math.min(99999,Math.floor(n))):0;}

export function enemy2ActivityId(stage){
  if(stage?.postCp3DeepSurvey)return'survey';
  if(stage?.isRift)return'rift';
  if(stage?.isAbyss)return'abyss';
  if(stage?.secretRealm)return'secret';
  return'story';
}

export function enemy2EcologyIdentity(enemy){
  if(!enemy||enemy.boss)return null;
  if(enemy.speciesId){
    const species=globalEnemySpecies(enemy.speciesId);
    return{key:`global:${enemy.speciesId}`,name:species?.name||enemy.speciesId,kind:'global',speciesId:enemy.speciesId};
  }
  const type=enemy.type||enemy.enemyType;
  if(!type)return null;
  const rawName=String(enemy.name||type);
  const baseName=enemy.variantName&&rawName.startsWith(enemy.variantName)?rawName.slice(String(enemy.variantName).length):rawName;
  return{key:`type:${type}`,name:baseName||type,kind:enemy.rareIdentity?'regionalRare':'regional',enemyType:type};
}

export function ensureEnemy2Ecology(entries){
  if(!entries[ENEMY2_ECOLOGY_KEY]||typeof entries[ENEMY2_ECOLOGY_KEY]!=='object'||Array.isArray(entries[ENEMY2_ECOLOGY_KEY]))entries[ENEMY2_ECOLOGY_KEY]={};
  return entries[ENEMY2_ECOLOGY_KEY];
}

export function recordEnemy2Discovery(entries,enemy,stage,{kill=false}={}){
  const identity=enemy2EcologyIdentity(enemy);if(!identity)return null;
  const ecology=ensureEnemy2Ecology(entries);
  const e=ecology[identity.key]||(ecology[identity.key]={name:identity.name,kind:identity.kind,speciesId:identity.speciesId||null,enemyType:identity.enemyType||null,seen:true,kills:0,variants:[],ranks:[],activities:[],regionTags:[],maxLevel:0});
  e.seen=true;e.name ||= identity.name;e.variants=cleanList(e.variants);e.ranks=cleanList(e.ranks);e.activities=cleanList(e.activities);e.regionTags=cleanList(e.regionTags);
  if(kill)e.kills=Math.max(0,Number(e.kills)||0)+1;
  const level=safeLevel(enemy);if(level)e.maxLevel=Math.max(Number(e.maxLevel)||0,level);
  if(enemy.variantId)addUnique(e.variants,enemy.variantId);
  if(enemy.rank==='rare'||enemy.rareIdentity)addUnique(e.ranks,'rare');
  if(enemy.genericElite)addUnique(e.ranks,'elite');
  if(enemy.elite)addUnique(e.ranks,'abyssElite');
  addUnique(e.activities,enemy2ActivityId(stage));
  for(const tag of stage?.encounterPool?.regionTags||stage?.dropRegionTags||[])addUnique(e.regionTags,String(tag));
  return e;
}

export function enemy2EcologyEntries(entries={}){
  const ecology=entries?.[ENEMY2_ECOLOGY_KEY];
  if(!ecology||typeof ecology!=='object'||Array.isArray(ecology))return[];
  return Object.entries(ecology).map(([key,value])=>({key,...value})).filter(e=>e?.seen).sort((a,b)=>String(a.name).localeCompare(String(b.name),'ja'));
}
