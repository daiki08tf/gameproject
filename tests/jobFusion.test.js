import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_FUSION_JOBS, FUSION_VALIDATION, getFusionJob, generatedFusionId } from '../js/data/jobFusion.js';
import { createConstellation, unlockNode } from '../js/systems/jobConstellation.js';

test('Phase 8 registry contains exactly 105 unique pairs',()=>{
  assert.equal(ALL_FUSION_JOBS.length,105);
  assert.equal(FUSION_VALIDATION.ok,true, FUSION_VALIDATION.errors.join('\n'));
  assert.deepEqual(FUSION_VALIDATION.counts,{ids:105,pairs:105,names:105,legacy:30,fusion:75});
});

test('legacy ids survive while display names can evolve',()=>{
  assert.equal(getFusionJob('warrior','fighter').id,'battlemaster');
  assert.equal(getFusionJob('fighter','warrior').name,'羅刹');
  assert.equal(getFusionJob('thief','merchant').id,'treasurehunter');
});

test('new pair ids are deterministic and order independent',()=>{
  assert.equal(generatedFusionId('warrior','merchant'),'fusion_warrior_merchant');
  assert.equal(generatedFusionId('merchant','warrior'),'fusion_warrior_merchant');
  assert.equal(getFusionJob('thief','scholar').name,'遺跡探究家');
});

test('every fusion job has identity, resource, constellation and loot metadata',()=>{
  for(const job of ALL_FUSION_JOBS){
    assert.ok(job.fusionTrait?.id, job.id);
    assert.ok(job.resourceInteraction?.id, job.id);
    assert.ok(job.constellation?.ultimate, job.id);
    assert.ok(job.lootTags.length>=4, job.id);
  }
});

test('constellation enforces branches -> trait -> keystones -> ultimate',()=>{
  const tree=createConstellation('spellblade');
  let state={points:20,ownedNodeIds:['core']};
  state=unlockNode(tree,'warrior_I',state);
  state=unlockNode(tree,'mage_I',state);
  state=unlockNode(tree,'fusion_trait',state);
  let blocked=unlockNode(tree,'ultimate',state);
  assert.equal(blocked.lastError,'requirements');
  state=unlockNode(tree,'warrior_II',state);
  state=unlockNode(tree,'mage_II',state);
  state=unlockNode(tree,'keystone_a',state);
  state=unlockNode(tree,'keystone_b',state);
  state=unlockNode(tree,'ultimate',state);
  assert.equal(state.lastError,null);
  assert.ok(state.ownedNodeIds.includes('ultimate'));
});
