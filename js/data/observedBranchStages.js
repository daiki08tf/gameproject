/* Blade Vale — Observed Branches CLR-21: Stage-first playable proof.
   Branch Stages are ordinary findStage()-resolvable battle stages, built the
   same way Abyss/Secret Realm/Raid stages are (see stages.js's findStage()
   prefix dispatch and raidBosses.js's buildRaidStage()) — a static authored
   definition resolved into a full stage object on demand. They reuse their
   own Prime Chapter's enemy archetypes and Encounter 2.0 pool (Ch2 for
   Branch Cluster 1, Ch5 for M9's Branch Cluster 2), plus the existing
   state.data.stageProgress / state.isStageCleared authority.
   No new combat, save, clear, encounter, or loot authority is introduced here. */
import { OBSERVED_BRANCHES, observedBranchById, OBSERVED_BRANCH_PROFILE_LEVELS } from './observedBranches.js';
import { CHAPTER_REGION_TAGS } from './chapters.js';
import { ENEMY_TYPES } from './enemies.js';
import { buildChapterEncounterPool } from './encounterMigration2.js';

// Keyed by the exact Stage IDs referenced from observedBranches.js's
// `stageIds` — one authored definition per Branch Stage. Waves reference each
// Branch's own Prime Chapter's enemy archetypes (already registered by
// js/data/enemies.js). M5 routes Branch-native equipment through the same
// dropTable / firstClear fields already consumed by BattleEngine; no Branch
// loot authority exists.
const BRANCH_STAGE_DATA=Object.freeze({
  'observedbranch-tree-sovereign-1':Object.freeze({
    name:'樹冠の第一階層',
    recLevel:9,
    waves:Object.freeze([{type:'ch2_normal',count:5,interval:1.3}]),
    rewards:Object.freeze({gold:60,exp:48}),
    dropTable:Object.freeze([
      {itemId:'ob_tree_crown_seed',weight:2},
      {itemId:'ob_tree_thorn_bow',weight:1},
    ]),
  }),
  'observedbranch-tree-sovereign-2':Object.freeze({
    name:'生体建築の回廊',
    recLevel:11,
    waves:Object.freeze([
      {type:'ch2_normal',count:4,interval:1.1},
      {type:'ch2_fast',count:3,interval:0.9},
      {type:'ch2_tank',count:2,interval:1.8},
    ]),
    rewards:Object.freeze({gold:85,exp:68}),
    dropTable:Object.freeze([
      {itemId:'ob_tree_symbiotic_shield',weight:1.5},
      {itemId:'ob_tree_living_body',weight:1.5},
      {itemId:'ob_tree_root_staff',weight:1},
    ]),
  }),
  'observedbranch-tree-sovereign-boss':Object.freeze({
    name:'王樹領：生存した大樹霊',
    boss:true,
    recLevel:14,
    waves:Object.freeze([
      {type:'ch2_tank',count:2,interval:1.6},
      {type:'ch2_boss',count:1,interval:0},
    ]),
    rewards:Object.freeze({gold:220,exp:170}),
    firstClear:Object.freeze({itemId:'uq_observed_verdant'}),
    dropTable:Object.freeze([
      {itemId:'ob_tree_root_staff',weight:1},
      {itemId:'ob_tree_crown_seed',weight:1},
    ]),
  }),
  'observedbranch-deepgreen-absence-1':Object.freeze({
    name:'空白域の測線',
    recLevel:9,
    waves:Object.freeze([
      {type:'ch2_fast',count:3,interval:1.0},
      {type:'ch2_normal',count:3,interval:1.2},
    ]),
    rewards:Object.freeze({gold:62,exp:50}),
    dropTable:Object.freeze([
      {itemId:'ob_absence_survey_head',weight:2},
      {itemId:'ob_absence_echo_dagger',weight:1},
    ]),
  }),
  'observedbranch-deepgreen-absence-2':Object.freeze({
    name:'根記憶の残響路',
    recLevel:11,
    waves:Object.freeze([
      {type:'ch2_normal',count:3,interval:1.1},
      {type:'ch2_fast',count:3,interval:0.9},
      {type:'ch2_tank',count:2,interval:1.8},
    ]),
    rewards:Object.freeze({gold:88,exp:70}),
    dropTable:Object.freeze([
      {itemId:'ob_absence_blank_body',weight:2},
      {itemId:'ob_absence_survey_rod',weight:1},
    ]),
  }),
  'observedbranch-deepgreen-absence-boss':Object.freeze({
    name:'根無き森核・NULL CANOPY',
    boss:true,
    recLevel:14,
    waves:Object.freeze([
      {type:'ch2_fast',count:2,interval:1.0},
      {type:'ch2_boss',count:1,interval:0},
    ]),
    rewards:Object.freeze({gold:225,exp:175}),
    firstClear:Object.freeze({itemId:'uq_observed_null_root'}),
    dropTable:Object.freeze([
      {itemId:'ob_absence_echo_dagger',weight:1},
      {itemId:'uq_observed_blank_compass',weight:.35},
    ]),
  }),
  // M9 — Branch Cluster 2's first vertical slice (灼熱の火山 / Ch5). Mirrors
  // M4's minimal-footprint precedent: regular dropTables reuse the existing
  // generic ch5_* equipment placeholders; only the boss firstClear is a new
  // Branch-native Unique (a follow-up M5-equivalent gear phase can enrich the
  // regular dropTables later, exactly like M5 did for Branch Cluster 1).
  'observedbranch-flame-king-1':Object.freeze({
    name:'熔鉱都市の外郭',
    recLevel:29,
    waves:Object.freeze([{type:'ch5_normal',count:5,interval:1.3}]),
    rewards:Object.freeze({gold:110,exp:88}),
    dropTable:Object.freeze([{itemId:'ch5_accessory',weight:1}]),
  }),
  'observedbranch-flame-king-2':Object.freeze({
    name:'王家熔鉱炉の回廊',
    recLevel:31,
    waves:Object.freeze([
      {type:'ch5_normal',count:4,interval:1.1},
      {type:'ch5_fast',count:3,interval:0.9},
      {type:'ch5_tank',count:2,interval:1.8},
    ]),
    rewards:Object.freeze({gold:150,exp:120}),
    dropTable:Object.freeze([
      {itemId:'ch5_shield',weight:1},
      {itemId:'ch5_head',weight:1},
    ]),
  }),
  'observedbranch-flame-king-boss':Object.freeze({
    name:'炎帝領：戴冠せし神王・EMBER THRONE',
    boss:true,
    recLevel:34,
    waves:Object.freeze([
      {type:'ch5_tank',count:2,interval:1.6},
      {type:'ch5_boss',count:1,interval:0},
    ]),
    rewards:Object.freeze({gold:390,exp:300}),
    firstClear:Object.freeze({itemId:'uq_observed_ember_throne'}),
    dropTable:Object.freeze([
      {itemId:'ch5_weapon',weight:1},
      {itemId:'ch5_body',weight:1},
    ]),
  }),
});

// Every authored Branch is the divergent form of its own Prime Chapter, so it
// projects that Chapter's own E8 Encounter Pool contract instead of inventing
// a Branch-only enemy table. Fixed authored waves remain the fallback/headcount
// authority; the pool only enables the already-live Chapter Rare, generic
// World Tier Elite, regional roles and environmental Variant behavior. This is
// keyed by the Branch's own primeRegionRef.chapterId (M9 added a second Prime
// Chapter, Ch5, alongside Ch2 — this must not stay hardcoded to one Chapter).
function encounterSourceForChapterId(chapterId){
  return Object.freeze({
    id:chapterId,
    stages:Object.freeze([Object.freeze({dropRegionTags:Object.freeze([...(CHAPTER_REGION_TAGS[chapterId]||[])])})]),
  });
}

function buildObservedBranchEncounterPool(chapterId){
  const pool=buildChapterEncounterPool(encounterSourceForChapterId(chapterId),ENEMY_TYPES);
  return{
    ...pool,
    types:(pool.types||[]).map(entry=>({...entry})),
    templates:[...(pool.templates||[])],
    rareTypes:(pool.rareTypes||[]).map(entry=>({...entry})),
    regionTags:[...(pool.regionTags||[])],
  };
}

function branchIdForStage(stageId){
  for(const branch of OBSERVED_BRANCHES){
    if(branch?.stageIds?.includes(stageId))return branch.id;
  }
  return null;
}

export function observedBranchProfileSummary(branchId){
  const branch=observedBranchById(branchId);
  if(!branch)return'';
  const ecology=Object.values(branch.ecologyProfile||{}).join(' / ');
  const technology=Object.entries(branch.technologyProfile||{})
    .map(([axis,level])=>`${axis} ${branch.technologyPresentation?.[axis]||OBSERVED_BRANCH_PROFILE_LEVELS[level]||level}`)
    .join(' / ');
  return `生態：${ecology}\n技術：${technology}`;
}

// findStage()-compatible builder: mirrors buildRaidStage()/buildSecretRealmStage()
// shape exactly (id, name, waves, rewards, dropTable, optional boss/firstClear),
// plus a small observedBranch marker so UI/confirm screens can present it
// distinctly without introducing a second combat/reward pipeline.
export function buildObservedBranchStage(stageId){
  const data=BRANCH_STAGE_DATA[stageId];
  if(!data)return null;
  const branchId=branchIdForStage(stageId);
  const branch=branchId?observedBranchById(branchId):null;
  const profile=branchId?observedBranchProfileSummary(branchId):'';
  const primeChapterId=branch?.primeRegionRef?.chapterId||'ch2';
  return{
    id:stageId,
    name:data.name,
    recLevel:data.recLevel,
    boss:!!data.boss,
    waves:data.waves.map(wave=>({...wave})),
    rewards:{...data.rewards},
    dropTable:data.dropTable.map(drop=>({...drop})),
    firstClear:data.firstClear?{...data.firstClear}:undefined,
    encounterPool:buildObservedBranchEncounterPool(primeChapterId),
    dropRegionTags:[...(CHAPTER_REGION_TAGS[primeChapterId]||[])],
    observedBranch:true,
    observedBranchId:branchId,
    // stageSelect's existing observed-Branch confirmation surface renders this
    // label, so M4 ecology/technology presentation is derived from canonical
    // Branch history data without adding a new screen or persistence root.
    observedBranchLabel:[branch?.observedLabel||branch?.name||null,profile].filter(Boolean).join('\n'),
  };
}

// Derived progress only — no new save flag. Stage N unlocks once Stage N-1
// (by the Branch's own authored stageIds order) is cleared through the
// existing state.isStageCleared authority, exactly like ordinary Chapter
// stage progression.
export function observedBranchStageProgress(branchId,{isStageCleared=()=>false}={}){
  const branch=observedBranchById(branchId);
  const stageIds=branch?.stageIds||[];
  if(!stageIds.length)return Object.freeze({stages:[],nextStageId:null,bossStageId:null,cleared:false});
  let nextStageId=null;
  const stages=stageIds.map((id,index)=>{
    const data=BRANCH_STAGE_DATA[id];
    const cleared=isStageCleared(id);
    const unlocked=index===0||isStageCleared(stageIds[index-1]);
    if(unlocked&&!cleared&&nextStageId==null)nextStageId=id;
    return Object.freeze({id,name:data?.name||id,index,boss:!!data?.boss,unlocked,cleared});
  });
  const bossStageId=branch.bossStageId||stageIds.at(-1);
  return Object.freeze({stages:Object.freeze(stages),nextStageId,bossStageId,cleared:isStageCleared(bossStageId)});
}

export function isObservedBranchCleared(branchId,{isStageCleared=()=>false}={}){
  const branch=observedBranchById(branchId);
  if(!branch?.bossStageId)return false;
  return isStageCleared(branch.bossStageId);
}

// CLR-21 Branch Hunt is a read-only projection of the already-cleared Branch
// Stages. It deliberately owns no session/progression state: each target is
// launched through the same buildObservedBranchStage() -> existing battle /
// reward path as Story replay. The UI can present different hunt intentions
// without inventing a Hunt level, currency, stamina, or save root.
export function observedBranchHuntTargets(branchId,{isStageCleared=()=>false}={}){
  const progress=observedBranchStageProgress(branchId,{isStageCleared});
  if(!progress.cleared)return Object.freeze([]);
  return Object.freeze(progress.stages.map(stageInfo=>{
    const stage=buildObservedBranchStage(stageInfo.id);
    const role=stageInfo.boss?'boss':stageInfo.index===0?'ecology':'deep';
    const huntName=role==='deep'?`Rare / Elite：${stage?.name||stageInfo.name}`:(stage?.name||stageInfo.name);
    return Object.freeze({
      stageId:stageInfo.id,
      role,
      name:huntName,
      recLevel:stage?.recLevel||0,
      dropTable:Object.freeze((stage?.dropTable||[]).map(drop=>Object.freeze({...drop}))),
    });
  }));
}
