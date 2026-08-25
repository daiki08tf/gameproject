import test from 'node:test';
import assert from 'node:assert/strict';
import { getJob } from '../js/data/jobsPhase8.js';
import { fusionRegistryAudit } from '../js/data/jobFusionRegistry.js';

test('live Fusion registry remains valid after runtime integration',()=>{
  const audit=fusionRegistryAudit();
  assert.equal(audit.ok,true,JSON.stringify(audit.errors));
  assert.equal(audit.counts.total,105);
});

test('generated Fusion jobs expose playable advanced records',()=>{
  for(const id of ['fusion_warrior_merchant','fusion_thief_scholar','fusion_mage_ninja']){
    const job=getJob(id);
    assert.ok(job,id);
    assert.equal(job.tier,'advanced');
    assert.equal(job.isFusionJob,true);
    assert.equal(job.requires.length,2);
  }
});

test('legacy advanced IDs are still canonical runtime jobs',()=>{
  assert.equal(getJob('spellblade').name,'魔法剣士');
  assert.equal(getJob('paladin').name,'パラディン');
});
