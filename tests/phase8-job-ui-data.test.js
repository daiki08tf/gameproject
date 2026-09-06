import test from 'node:test';
import assert from 'node:assert/strict';
import { jobsByTier, allJobs, getJob } from '../js/data/jobsPhase8.js';

test('C1 browser exposes only the curated tactical roster',()=>{
  assert.equal(jobsByTier('basic').length,10);
  assert.equal(jobsByTier('advanced').length,0);
  assert.equal(jobsByTier('special').length,0);
  assert.equal(jobsByTier('hero').length,0);
  assert.equal(allJobs().length,10);
  assert.equal(getJob('c1_bastion').name,'城塞');
});

test('generated Fusion jobs expose searchable parent metadata',()=>{
  const job=getJob('fusion_warrior_merchant');
  assert.ok(job);
  assert.deepEqual(job.requires,['warrior','merchant']);
  assert.ok(job.fusion?.fusionTrait);
  assert.ok(job.fusion?.resourceInteraction);
});
