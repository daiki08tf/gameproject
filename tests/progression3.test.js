import test from 'node:test';
import assert from 'node:assert/strict';
import { JOB_EXP_SHARE_BY_TIER, growthForJob, activeJobModifier, mdefProfileFor } from '../js/data/progression3.js';
import { getJob } from '../js/data/jobs.js';

test('basic jobs level Job EXP faster than higher tiers',()=>{
  assert.deepEqual(JOB_EXP_SHARE_BY_TIER,{basic:0.30,advanced:0.20,special:0.15,hero:0.10});
});

test('warrior permanent growth favors physical stats while mage favors magic',()=>{
  const warrior=growthForJob('warrior');
  const mage=growthForJob('mage');
  assert.ok(warrior.hp>mage.hp);
  assert.ok(warrior.def>mage.def);
  assert.ok(mage.mag>warrior.mag);
  assert.ok(mage.mdef>warrior.mdef);
});

test('MDEF profile derives from MAG and DEF and active job modifier stays modest',()=>{
  const warrior=getJob('warrior'), mage=getJob('mage');
  assert.ok(mdefProfileFor(mage)>mdefProfileFor(warrior));
  assert.ok(activeJobModifier('mage','mag')<=1.15);
  assert.ok(activeJobModifier('warrior','mag')>=0.91);
});
