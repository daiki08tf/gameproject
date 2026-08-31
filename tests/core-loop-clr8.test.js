import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP4_DEEP_GREEN_CHAIN,cp4DeepGreenProgress,cp4DeepGreenStepForStage } from '../js/data/contentPackIVA.js';
import { CP4_PARALLAX_CONTACT,cp4ParallaxProgress,cp4ParallaxContactForStage } from '../js/data/contentPackIVB.js';
import { CP4_BRANCH_SIGHT_AWAKENING,cp4BranchSightProgress,cp4BranchSightActivationForStage } from '../js/data/contentPackIVC.js';

const cleared=id=>id==='35-8';

test('CP4 contradiction chain remains deterministic and ordered',()=>{
  const discoveries={};
  assert.equal(cp4DeepGreenStepForStage('2-1',{discoveries,isStageCleared:cleared})?.discoveryId,'cp4:deepgreen:prime-record');
  discoveries['cp4:deepgreen:prime-record']={};
  assert.equal(cp4DeepGreenStepForStage('2-3',{discoveries,isStageCleared:cleared})?.discoveryId,'cp4:deepgreen:survival-record');
  discoveries['cp4:deepgreen:survival-record']={};
  assert.equal(cp4DeepGreenStepForStage('2-5',{discoveries,isStageCleared:cleared})?.discoveryId,'cp4:deepgreen:no-forest-memory');
});

test('Parallax and Branch Sight still require separate ordered revisits',()=>{
  const discoveries={
    'cp4:deepgreen:prime-record':{},
    'cp4:deepgreen:survival-record':{},
    'cp4:deepgreen:no-forest-memory':{},
    'cp4:deepgreen:overlap-coordinate':{},
  };
  assert.equal(cp4ParallaxProgress({discoveries}).nextStageId,'2-5');
  assert.equal(cp4ParallaxContactForStage('2-5',{discoveries})?.discoveryId,CP4_PARALLAX_CONTACT.discoveryId);
  assert.equal(cp4BranchSightProgress({discoveries}).state,'locked');
  discoveries[CP4_PARALLAX_CONTACT.discoveryId]={};
  assert.equal(cp4BranchSightProgress({discoveries}).nextStageId,'2-5');
  assert.equal(cp4BranchSightActivationForStage('2-5',{discoveries})?.discoveryId,CP4_BRANCH_SIGHT_AWAKENING.discoveryId);
});

test('CLR-8 records all CP4 core discoveries from battle-end callbacks only after clear',()=>{
  const a=fs.readFileSync('js/patches/contentPackIVA.js','utf8');
  const b=fs.readFileSync('js/patches/contentPackIVB.js','utf8');
  const c=fs.readFileSync('js/patches/contentPackIVC.js','utf8');
  assert.match(a,/function recordStep\(stageId,result\)[\s\S]*if\(!result\?\.cleared\)return null;/);
  assert.match(b,/function recordContact\(stageId,wasReady,result\)[\s\S]*if\(!wasReady\|\|!result\?\.cleared\)return null;/);
  assert.match(c,/function recordAwakening\(stageId,wasReady,result\)[\s\S]*if\(!wasReady\|\|!result\?\.cleared\)return null;/);
  for(const src of [a,b,c]){
    assert.match(src,/const wrappedOnEnd=\(result\)=>/);
    assert.match(src,/previousStart\.call\(this,stageId,wrappedOnEnd,blessingId\)/);
  }
});

test('CLR-8 battle victory is idempotent: re-evaluating a victory on an already-recorded stage is a no-op',()=>{
  // Deep Green: once a step's discoveryId is already present, progress has
  // moved past it, so cp4DeepGreenStepForStage no longer matches that stage
  // as the "next" step — a repeated victory on the same stage records
  // nothing new.
  const deepGreen={discoveries:{'cp4:deepgreen:prime-record':{}},isStageCleared:cleared};
  assert.equal(cp4DeepGreenStepForStage('2-1',deepGreen),null);
  // Parallax first contact: once recorded, cp4ParallaxContactForStage never
  // reissues the same event for a re-evaluated victory on the same revisit.
  const parallax={discoveries:{
    [CP4_PARALLAX_CONTACT.prerequisiteDiscoveryId]:{},
    [CP4_PARALLAX_CONTACT.discoveryId]:{},
  }};
  assert.equal(cp4ParallaxContactForStage(CP4_PARALLAX_CONTACT.investigationStageId,parallax),null);
  // Branch Sight activation: same guarantee.
  const branchSight={discoveries:{
    [CP4_BRANCH_SIGHT_AWAKENING.prerequisiteDiscoveryId]:{},
    [CP4_BRANCH_SIGHT_AWAKENING.discoveryId]:{},
  }};
  assert.equal(cp4BranchSightActivationForStage(CP4_BRANCH_SIGHT_AWAKENING.activationStageId,branchSight),null);
});

test('CLR-8 keeps existing Discovery IDs and does not add RNG or reward authority',()=>{
  assert.equal(CP4_DEEP_GREEN_CHAIN.steps[0].discoveryId,'cp4:deepgreen:prime-record');
  assert.equal(CP4_PARALLAX_CONTACT.discoveryId,'cp4:parallax:first-contact');
  assert.equal(CP4_BRANCH_SIGHT_AWAKENING.discoveryId,'cp4:branch-sight:active');
  const src=['contentPackIVA.js','contentPackIVB.js','contentPackIVC.js'].map(name=>fs.readFileSync(`js/patches/${name}`,'utf8')).join('\n');
  assert.doesNotMatch(src,/Math\.random|addItem\(|dropMultiplier|goldMultiplier|itemPowerBonus|currency/i);
});
