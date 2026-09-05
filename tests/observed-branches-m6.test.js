import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BattleEngine } from '../js/battleEngine.js';
import { getItem } from '../js/data/equipment.js';
import { fixedEquipmentIdentities, FIXED_IDENTITY_KIND } from '../js/data/equipmentFixedIdentity.js';
import { findStage } from '../js/data/stages.js';
import { knownObservedBranches } from '../js/data/observedBranchDiscovery.js';
import { observedBranchById } from '../js/data/observedBranches.js';
import { buildObservedBranchStage, observedBranchProfileSummary, observedBranchStageProgress, isObservedBranchCleared } from '../js/data/observedBranchStages.js';
import { CP4_SECOND_BRANCH_ANCHOR, cp4SecondBranchAnchorProgress } from '../js/data/contentPackIVD.js';
import { CP4_HORIZONTAL_REACTIONS } from '../js/data/contentPackIVE.js';
import { unique2IdentityById } from '../js/data/unique2IdentityLibrary.js';

const BRANCH_ID='deep-green-absence';
const FIRST_ANCHOR='cp4:branch-anchor:tree-sovereign';
const SECOND_ANCHOR='cp4:branch-anchor:deep-green-absence';

test('Observed Branches M6 authors 深緑消失域 as the second Ch2 Branch with the roadmap technology profile',()=>{
  const branch=observedBranchById(BRANCH_ID);
  const sibling=observedBranchById('tree-sovereign-deep-green');
  assert.ok(branch);
  assert.equal(branch.primeRegionRef.chapterId,'ch2');
  assert.deepEqual(branch.primeRegionRef,sibling.primeRegionRef);
  assert.deepEqual(branch.technologyProfile,{mechanical:'baseline',arcane:'regressed',bio:'regressedMajor',boundary:'dominant',information:'advancedMajor',material:'advanced'});
  assert.match(branch.divergencePoint,/境界崩壊/);
  assert.match(branch.divergencePoint,/森林圏そのものが消失/);
  assert.match(branch.ecologyProfile.species,/種族は消滅/);
  assert.match(branch.ecologyProfile.species,/根の記憶/);
  assert.deepEqual(branch.discoveryConditions.allDiscoveries,[SECOND_ANCHOR]);
  assert.equal(branch.discoveryConditions.rngRequired,false);
  const summary=observedBranchProfileSummary(BRANCH_ID);
  assert.match(summary,/mechanical →/);
  assert.match(summary,/arcane ↓/);
  assert.match(summary,/bio ↓↓↓(?: \/|$)/);
  assert.match(summary,/boundary ↑↑↑/);
  assert.match(summary,/information ↑↑/);
  assert.match(summary,/material ↑/);
});

test('M6 discovery reuses deterministic CP4 Branch Sight/anchor authority and does not reveal the Branch early',()=>{
  assert.equal(CP4_SECOND_BRANCH_ANCHOR.discoveryId,SECOND_ANCHOR);
  assert.equal(cp4SecondBranchAnchorProgress({discoveries:{}}).visible,false);
  const prereqs={'cp4:branch-sight:active':{at:1},'cp4:parallax:first-contact':{at:2},[FIRST_ANCHOR]:{at:3}};
  const ready=cp4SecondBranchAnchorProgress({discoveries:prereqs});
  assert.equal(ready.state,'recognizable');
  assert.equal(ready.observed,false);
  assert.deepEqual(knownObservedBranches({discoveries:prereqs}).map(x=>x.id),['tree-sovereign-deep-green']);
  const observed={...prereqs,[SECOND_ANCHOR]:{at:4}};
  assert.equal(cp4SecondBranchAnchorProgress({discoveries:observed}).observed,true);
  assert.deepEqual(knownObservedBranches({discoveries:observed}).map(x=>x.id),['tree-sovereign-deep-green',BRANCH_ID]);
});

test('M6 stages resolve through findStage and derive unlock/clear from existing stageProgress authority',()=>{
  const branch=observedBranchById(BRANCH_ID);
  for(const stageId of branch.stageIds){
    const found=findStage(stageId);
    const stage=found?.stage;
    assert.ok(stage,`${stageId} must resolve through findStage()`);
    assert.equal(stage.observedBranchId,BRANCH_ID);
    for(const drop of stage.dropTable)assert.ok(getItem(drop.itemId),`${drop.itemId} must resolve through getItem()`);
  }
  const boss=buildObservedBranchStage(branch.bossStageId);
  assert.equal(boss.name,'根無き森核・NULL CANOPY');
  assert.equal(boss.firstClear.itemId,'uq_observed_null_root');
  assert.ok(getItem(boss.firstClear.itemId));
  const cleared=new Set();
  let progress=observedBranchStageProgress(BRANCH_ID,{isStageCleared:id=>cleared.has(id)});
  assert.equal(progress.nextStageId,branch.stageIds[0]);
  assert.equal(progress.cleared,false);
  cleared.add(branch.stageIds[0]);
  progress=observedBranchStageProgress(BRANCH_ID,{isStageCleared:id=>cleared.has(id)});
  assert.equal(progress.nextStageId,branch.stageIds[1]);
  cleared.add(branch.stageIds[1]);
  cleared.add(branch.bossStageId);
  assert.equal(isObservedBranchCleared(BRANCH_ID,{isStageCleared:id=>cleared.has(id)}),true);
});

test('NULL ROOT is a Fixed Unique using existing Unique2 identity authority',()=>{
  const item=getItem('uq_observed_null_root');
  assert.ok(item);
  assert.equal(item.unique,true);
  assert.equal(item.rarity,'legendary');
  assert.equal(item.unique2IdentityId,'u2_sword_null_root');
  const authored=unique2IdentityById(item.unique2IdentityId);
  assert.ok(authored);
  assert.equal(authored.effects[0].kind,'noRecoveryDmgBonus');
  const fixed=fixedEquipmentIdentities(item);
  assert.equal(fixed.length,1);
  assert.equal(fixed[0].kind,FIXED_IDENTITY_KIND.UNIQUE);
  assert.equal(fixed[0].identityId,'u2_sword_null_root');
  assert.equal(fixed[0].consumesOptionSlot,false);
  assert.equal(fixed[0].optionFusionEligible,false);
});

function damageEngine(effects,{regenPower=0,regenBuff={value:0,turnsLeft:0}}={}){
  const engine=Object.create(BattleEngine.prototype);
  engine.effects=effects.map(x=>({...x}));
  engine.awakenMult=1;
  engine._bloodChaliceTurns=0;
  engine._bloodChaliceBonus=0;
  engine._tempAtkTurns=0;
  engine._tempAtkBonus=0;
  engine._tempDmgBonusTurns=0;
  engine._tempDmgBonus=0;
  engine._regenPower=regenPower;
  engine._lastPlayerFirst=false;
  engine.player={buffs:{regenAdd:{...regenBuff}}};
  return engine;
}

test('NULL ROOT bonus is active only while recovery/regeneration equipment effects are absent',()=>{
  const nullRoot={trigger:'passive',kind:'noRecoveryDmgBonus',power:.22};
  assert.equal(damageEngine([nullRoot])._mainDmgMult('normal'),1.22);
  assert.equal(damageEngine([nullRoot,{trigger:'passive',kind:'regen',power:.01}])._mainDmgMult('normal'),1);
  assert.equal(damageEngine([nullRoot,{trigger:'onKill',kind:'healOnKill',power:.04}])._mainDmgMult('normal'),1);
  assert.equal(damageEngine([nullRoot],{regenBuff:{value:.01,turnsLeft:2}})._mainDmgMult('normal'),1);
});

test('M6 Codex/Chronicle definitions record divergence, ecology and all six technology axes through existing CP4 records',()=>{
  const codex=CP4_HORIZONTAL_REACTIONS.secondaryCodex;
  assert.equal(codex.sourceDiscoveryId,SECOND_ANCHOR);
  assert.match(codex.text,/分岐点：/);
  assert.match(codex.text,/生態：/);
  assert.match(codex.text,/Mechanical →/);
  assert.match(codex.text,/Arcane ↓/);
  assert.match(codex.text,/Bio ↓↓↓(?: \/|。)/);
  assert.match(codex.text,/Boundary ↑↑↑/);
  assert.match(codex.text,/Information ↑↑/);
  assert.match(codex.text,/Material ↑/);
  const row=CP4_HORIZONTAL_REACTIONS.chronicle.find(x=>x.sourceDiscoveryId===SECOND_ANCHOR);
  assert.ok(row);
  assert.match(row.title,/深緑消失域/);
});

test('M6 adds no new save/combat/loot authority and keeps CP4 DOM rendering emoji-free',()=>{
  const stageSrc=fs.readFileSync('js/data/observedBranchStages.js','utf8');
  const branchSrc=fs.readFileSync('js/data/observedBranches.js','utf8');
  const cp4Runtime=fs.readFileSync('js/patches/contentPackIVD.js','utf8');
  assert.doesNotMatch(stageSrc,/from ['"]\.\.\/state\.js['"]/);
  assert.doesNotMatch(stageSrc,/localStorage|\.save\(\)/);
  assert.doesNotMatch(branchSrc,/localStorage|stageProgress\s*=|worldTier\s*=/i);
  assert.match(cp4Runtime,/state\.data\.world2/);
  assert.doesNotMatch(cp4Runtime,/innerHTML/);
  assert.doesNotMatch(cp4Runtime,/◈|🌿|🔒|✅|❌/u);
});
