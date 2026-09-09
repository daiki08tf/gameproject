import test from 'node:test';
import assert from 'node:assert/strict';
import { jobsByTier, allJobs, getJob } from '../js/data/jobsPhase8.js';

// Restored 2026-09-08 (user decision): the C1 flat 10-job roster is retired
// from the active/selectable list in favor of the hand-authored tiered
// roster it replaced. The 75 auto-generated Fusion pairs stay excluded
// (see the 'generated Fusion jobs' test below for their compatibility path),
// and each surviving c1Combat loop is grafted onto its nearest advanced job
// (e.g. c1_bastion's loop -> armsknight, warrior+craftsman).
test('job browser exposes the tiered/fusion roster, not the retired flat C1 list',()=>{
  assert.equal(jobsByTier('basic').length,15);
  assert.equal(jobsByTier('advanced').length,30);
  assert.equal(jobsByTier('special').length,10);
  assert.equal(jobsByTier('hero').length,1);
  assert.equal(allJobs().length,56);
  assert.equal(getJob('armsknight').name,'アームズナイト');
  assert.ok(getJob('battlemaster').c1Combat, 'c1_vanguard\'s Pressure loop should graft onto battlemaster');
});

test('generated Fusion jobs expose searchable parent metadata',()=>{
  const job=getJob('fusion_warrior_merchant');
  assert.ok(job);
  assert.deepEqual(job.requires,['warrior','merchant']);
  assert.ok(job.fusion?.fusionTrait);
  assert.ok(job.fusion?.resourceInteraction);
});
