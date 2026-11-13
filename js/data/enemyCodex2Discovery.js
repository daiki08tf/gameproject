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

// 戦闘中の表示名から、隊列・役割の接頭辞（【前衛】等）と Variant 名、末尾の Lv 表記を外した素の種名。
export function enemy2PlainName(enemy){
  let name=String(enemy?.name||'');
  if(enemy?.variantName&&name.startsWith(enemy.variantName))name=name.slice(String(enemy.variantName).length);
  return name.replace(/^(?:【[^】]*】)+/,'').replace(/\s*Lv\.?\s*[\d,]+$/,'').trim();
}
// 保存済みの種名が内部ID（英数字とコロンだけ）のままかどうか。
export function isRawEcologyName(name){return /^[a-z0-9_]+(?::[a-z0-9_]+)+$/i.test(String(name||''));}

export function enemy2EcologyIdentity(enemy){
  if(!enemy||enemy.boss)return null;
  // 名もなき強敵（Roamer）は地域種ではなく徘徊者として記録する。
  // （speciesIdは遭遇元の地域種を継承しうるためroamerIdを優先する）
  if(enemy.roamerId)return{key:`roamer:${enemy.roamerId}`,name:String(enemy.name||enemy.roamerId),kind:'roamer',enemyType:enemy.type};
  if(enemy.speciesId){
    const species=globalEnemySpecies(enemy.speciesId);
    // 地域種の speciesId は 'regional:ch1:normal' / 'global:bat' のような内部IDで、
    // globalEnemySpecies() には登録が無い（271種）。以前はこの内部IDがそのまま
    // 図鑑の種名として保存・表示されていた。key は既存セーブとの互換のため変えず、
    // 表示名だけ敵自身の名前から取る。
    return{key:`global:${enemy.speciesId}`,name:species?.name||enemy2PlainName(enemy)||enemy.speciesId,kind:'global',speciesId:enemy.speciesId};
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
  e.seen=true;e.name ||= identity.name;if(isRawEcologyName(e.name)&&!isRawEcologyName(identity.name))e.name=identity.name; // 旧セーブの内部ID名は次の遭遇で直る
  e.variants=cleanList(e.variants);e.ranks=cleanList(e.ranks);e.activities=cleanList(e.activities);e.regionTags=cleanList(e.regionTags);
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
