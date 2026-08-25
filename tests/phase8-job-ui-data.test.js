import test from 'node:test';
import assert from 'node:assert/strict';
import { jobsByTier, allJobs, getJob } from '../js/data/jobsPhase8.js';

test('Phase 8 browser has full unified catalog',()=>{
  assert.equal(jobsByTier('basic').length,15);
  assert.equal(jobsByTier('advanced').length,105);
  assert.equal(jobsByTier('special').length,10);
  assert.equal(jobsByTier('hero').length,1);
  assert.equal(allJobs().length,131);
});

test('generated Fusion jobs expose searchable parent metadata',()=>{
  const job=getJob('fusion_warrior_merchant');
  assert.ok(job);
  assert.deepEqual(job.requires,['warrior','merchant']);
  assert.ok(job.fusion?.fusionTrait);
  assert.ok(job.fusion?.resourceInteraction);
});
