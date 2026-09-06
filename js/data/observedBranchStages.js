/* Blade Vale — Observed Branches CLR-21: Stage-first playable proof.
   Branch Stages are ordinary findStage()-resolvable battle stages, built the
   same way Abyss/Secret Realm/Raid stages are (see stages.js's findStage()
   prefix dispatch and raidBosses.js's buildRaidStage()) — a static authored
   definition resolved into a full stage object on demand. They reuse their
   own Prime Chapter's enemy archetypes and Encounter 2.0 pool (Ch2 for
   Branch Cluster 1, Ch5 for M9's Branch Cluster 2, Ch28 for M9's Branch
   Cluster 3, Ch19 for M9's Branch Cluster 4), plus the existing
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
      {itemId:'uq_observed_verdant_fang',weight:.35},
    ]),
  }),
  'observedbranch-tree-sovereign-boss':Object.freeze({
    name:'王樹領：生存した大樹霊',
    boss:true,
    recLevel:14,
    waves:Object.freeze([
      {type:'ch2_tank',count:2,interval:1.6},
      {type:'tree-sovereign-deep-green_boss',count:1,interval:0},
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
      {itemId:'uq_observed_null_fang',weight:.35},
    ]),
  }),
  'observedbranch-deepgreen-absence-boss':Object.freeze({
    name:'根無き森核・NULL CANOPY',
    boss:true,
    recLevel:14,
    waves:Object.freeze([
      {type:'ch2_fast',count:2,interval:1.0},
      {type:'deep-green-absence_boss',count:1,interval:0},
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
      {itemId:'uq_observed_royal_scale',weight:.35},
    ]),
  }),
  'observedbranch-flame-king-boss':Object.freeze({
    name:'炎帝領：戴冠せし神王・EMBER THRONE',
    boss:true,
    recLevel:34,
    waves:Object.freeze([
      {type:'ch5_tank',count:2,interval:1.6},
      {type:'flame-king-volcano_boss',count:1,interval:0},
    ]),
    rewards:Object.freeze({gold:390,exp:300}),
    firstClear:Object.freeze({itemId:'uq_observed_ember_throne'}),
    dropTable:Object.freeze([
      {itemId:'ch5_weapon',weight:1},
      {itemId:'ch5_body',weight:1},
    ]),
  }),
  // M9 continuation — Branch Cluster 3's first vertical slice (機界監査層 /
  // Ch28). Same minimal-footprint precedent as Cluster 2's first slice:
  // regular dropTables reuse the existing generic ch28_* equipment
  // placeholders; only the boss firstClear is a new Branch-native Unique.
  'observedbranch-mother-authority-1':Object.freeze({
    name:'統一監査区の前哨',
    recLevel:4050,
    waves:Object.freeze([{type:'ch28_normal',count:5,interval:1.3}]),
    rewards:Object.freeze({gold:1200,exp:980}),
    dropTable:Object.freeze([{itemId:'ch28_accessory',weight:1}]),
  }),
  'observedbranch-mother-authority-2':Object.freeze({
    name:'自動修復ユニット回廊',
    recLevel:4300,
    waves:Object.freeze([
      {type:'ch28_normal',count:4,interval:1.1},
      {type:'ch28_fast',count:3,interval:0.9},
      {type:'ch28_tank',count:2,interval:1.8},
    ]),
    rewards:Object.freeze({gold:1500,exp:1300}),
    dropTable:Object.freeze([
      {itemId:'ch28_shield',weight:1},
      {itemId:'ch28_head',weight:1},
    ]),
  }),
  'observedbranch-mother-authority-boss':Object.freeze({
    name:'全権域：全権掌握せし監査体・SOLE AUDITOR',
    boss:true,
    recLevel:4700,
    waves:Object.freeze([
      {type:'ch28_tank',count:2,interval:1.6},
      {type:'mother-full-authority_boss',count:1,interval:0},
    ]),
    rewards:Object.freeze({gold:2800,exp:2400}),
    firstClear:Object.freeze({itemId:'uq_observed_sole_auditor'}),
    dropTable:Object.freeze([
      {itemId:'ch28_weapon',weight:1},
      {itemId:'ch28_body',weight:1},
    ]),
  }),
  // M9 continuation — Branch Cluster 4's first (and, per the roadmap, last
  // queued) vertical slice (月蝕の境界 / Ch19). Same minimal-footprint
  // precedent as Clusters 2/3's first slices.
  'observedbranch-unbroken-veil-1':Object.freeze({
    name:'歪まぬ街道の外郭',
    recLevel:515,
    waves:Object.freeze([{type:'ch19_normal',count:5,interval:1.3}]),
    rewards:Object.freeze({gold:850,exp:700}),
    dropTable:Object.freeze([{itemId:'ch19_accessory',weight:1}]),
  }),
  'observedbranch-unbroken-veil-2':Object.freeze({
    name:'凍った鏡界の回廊',
    recLevel:545,
    waves:Object.freeze([
      {type:'ch19_normal',count:4,interval:1.1},
      {type:'ch19_fast',count:3,interval:0.9},
      {type:'ch19_tank',count:2,interval:1.8},
    ]),
    rewards:Object.freeze({gold:1100,exp:950}),
    dropTable:Object.freeze([
      {itemId:'ch19_shield',weight:1},
      {itemId:'ch19_head',weight:1},
    ]),
  }),
  'observedbranch-unbroken-veil-boss':Object.freeze({
    name:'不断領：閉ざされ続けた鏡界王・UNBROKEN SOVEREIGN',
    boss:true,
    recLevel:590,
    waves:Object.freeze([
      {type:'ch19_tank',count:2,interval:1.6},
      {type:'unbroken-veil_boss',count:1,interval:0},
    ]),
    rewards:Object.freeze({gold:1950,exp:1650}),
    firstClear:Object.freeze({itemId:'uq_observed_unbroken_sovereign'}),
    dropTable:Object.freeze([
      {itemId:'ch19_weapon',weight:1},
      {itemId:'ch19_body',weight:1},
    ]),
  }),
});

// Every authored Branch is the divergent form of its own Prime Chapter, so
// environmental region tags (fire/wind/dark/light/poison/ice — cosmetic
// Variant flavor, not ecology identity) still come from that Chapter. The
// regional/rare *identity* itself prefers the Branch's own Observed Branch
// M10 ecology (js/data/observedBranchEcology.js) when authored, keyed by the
// Branch's own id instead of the Prime Chapter's, so Branch encounters stop
// silently inheriting the Prime Chapter's rare/regional roster; it falls
// back to the Prime Chapter's own identity for any Branch that hasn't been
// given bespoke ecology yet (M9 Cluster expansion is not required to author
// this on day one).
function encounterSourceForBranch(branchId,chapterId){
  const usesBranchEcology=Boolean(ENEMY_TYPES[`${branchId}_rare`]);
  return Object.freeze({
    id:usesBranchEcology?branchId:chapterId,
    stages:Object.freeze([Object.freeze({dropRegionTags:Object.freeze([...(CHAPTER_REGION_TAGS[chapterId]||[])])})]),
  });
}

function buildObservedBranchEncounterPool(branchId,chapterId){
  const pool=buildChapterEncounterPool(encounterSourceForBranch(branchId,chapterId),ENEMY_TYPES);
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
    encounterPool:buildObservedBranchEncounterPool(branchId,primeChapterId),
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
