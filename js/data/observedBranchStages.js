/* Blade Vale — Observed Branches CLR-21: Stage-first playable proof.
   Branch Stages are ordinary findStage()-resolvable battle stages, built the
   same way Abyss/Secret Realm/Raid stages are (see stages.js's findStage()
   prefix dispatch and raidBosses.js's buildRaidStage()) — a static authored
   definition resolved into a full stage object on demand. They reuse the
   existing Chapter 2 enemy archetypes and Encounter 2.0 pool, plus the
   existing state.data.stageProgress / state.isStageCleared authority.
   No new combat, save, clear, encounter, or loot authority is introduced here. */
import { observedBranchById, OBSERVED_BRANCH_PROFILE_LEVELS } from './observedBranches.js';
import { CHAPTER_REGION_TAGS } from './chapters.js';
import { ENEMY_TYPES } from './enemies.js';
import { buildChapterEncounterPool } from './encounterMigration2.js';

// Keyed by the exact Stage IDs referenced from observedBranches.js's
// `stageIds` — one authored definition per Branch Stage. Waves reference the
// Chapter 2 enemy archetypes (already registered by js/data/enemies.js) and
// drop tables reference the existing Chapter 2 equipment item pool, so
// 王樹領・深緑の森's identity comes entirely from data, not new runtime.
const BRANCH_STAGE_DATA=Object.freeze({
  'observedbranch-tree-sovereign-1':Object.freeze({
    name:'樹冠の第一階層',
    recLevel:9,
    waves:Object.freeze([{type:'ch2_normal',count:5,interval:1.3}]),
    rewards:Object.freeze({gold:60,exp:48}),
    dropTable:Object.freeze([{itemId:'ch2_accessory',weight:1}]),
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
    dropTable:Object.freeze([{itemId:'ch2_shield',weight:1},{itemId:'ch2_head',weight:1}]),
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
    // Reuse Chapter 2's canonical epic weapon reward. `ch2_named_weapon`
    // never existed in the equipment authority and would create an orphan
    // inventory id when BattleEngine forwards firstClear.itemId to addItem().
    firstClear:Object.freeze({itemId:'ch2_weapon_epic'}),
    dropTable:Object.freeze([{itemId:'ch2_weapon',weight:1},{itemId:'ch2_body',weight:1}]),
  }),
});

// Observed 王樹領 is the divergent form of Prime Chapter 2, so it projects the
// same E8 Encounter Pool contract instead of inventing a Branch-only enemy
// table. Fixed authored waves remain the fallback/headcount authority; the
// pool only enables the already-live Chapter Rare, generic World Tier Elite,
// regional roles and environmental Variant behavior.
const CH2_ENCOUNTER_SOURCE=Object.freeze({
  id:'ch2',
  stages:Object.freeze([Object.freeze({dropRegionTags:Object.freeze([...(CHAPTER_REGION_TAGS.ch2||[])])})]),
});

function buildObservedBranchEncounterPool(){
  const pool=buildChapterEncounterPool(CH2_ENCOUNTER_SOURCE,ENEMY_TYPES);
  return{
    ...pool,
    types:(pool.types||[]).map(entry=>({...entry})),
    templates:[...(pool.templates||[])],
    rareTypes:(pool.rareTypes||[]).map(entry=>({...entry})),
    regionTags:[...(pool.regionTags||[])],
  };
}

function branchIdForStage(stageId){
  for(const branch of [observedBranchById('tree-sovereign-deep-green')]){
    if(branch?.stageIds?.includes(stageId))return branch.id;
  }
  return null;
}

export function observedBranchProfileSummary(branchId){
  const branch=observedBranchById(branchId);
  if(!branch)return'';
  const ecology=Object.values(branch.ecologyProfile||{}).join(' / ');
  const technology=Object.entries(branch.technologyProfile||{})
    .map(([axis,level])=>`${axis} ${OBSERVED_BRANCH_PROFILE_LEVELS[level]||level}`)
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
  return{
    id:stageId,
    name:data.name,
    recLevel:data.recLevel,
    boss:!!data.boss,
    waves:data.waves.map(wave=>({...wave})),
    rewards:{...data.rewards},
    dropTable:data.dropTable.map(drop=>({...drop})),
    firstClear:data.firstClear?{...data.firstClear}:undefined,
    encounterPool:buildObservedBranchEncounterPool(),
    dropRegionTags:[...(CHAPTER_REGION_TAGS.ch2||[])],
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
