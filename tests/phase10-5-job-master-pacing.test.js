import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JOB_TIER } from '../js/data/balance.js';
import {
  JOB_EXP_SHARE_BY_TIER,
  JOB_LEVELS_PER_REWARD_CAP,
  JOB_MASTERY_LEVEL_BY_TIER,
  minimumCappedRewardsToMaster,
  jobMasterPacingProfile,
} from '../js/data/progression3.js';

test('Job MASTER pacing contract matches canonical tier mastery levels',()=>{
  for(const tier of ['basic','advanced','special']){
    assert.equal(JOB_MASTERY_LEVEL_BY_TIER[tier],JOB_TIER[tier].masteryLv);
  }
});

test('fresh Jobs cannot be MASTERed by one oversized endgame reward',()=>{
  assert.equal(JOB_LEVELS_PER_REWARD_CAP,3);
  assert.equal(minimumCappedRewardsToMaster('basic'),5);
  assert.equal(minimumCappedRewardsToMaster('advanced'),10);
  assert.equal(minimumCappedRewardsToMaster('special'),17);
  for(const tier of ['basic','advanced','special'])assert.ok(minimumCappedRewardsToMaster(tier)>1);
});

test('higher Job tiers intentionally receive a smaller share of common EXP rewards',()=>{
  assert.ok(JOB_EXP_SHARE_BY_TIER.basic>JOB_EXP_SHARE_BY_TIER.advanced);
  assert.ok(JOB_EXP_SHARE_BY_TIER.advanced>JOB_EXP_SHARE_BY_TIER.special);
  assert.ok(JOB_EXP_SHARE_BY_TIER.special>JOB_EXP_SHARE_BY_TIER.hero);
  assert.deepEqual(
    ['basic','advanced','special','hero'].map(tier=>JOB_EXP_SHARE_BY_TIER[tier]),
    [0.30,0.20,0.15,0.10],
  );
});

test('near-MASTER Jobs finish promptly without bypassing the three-level cap',()=>{
  assert.equal(minimumCappedRewardsToMaster('basic',12),1);
  assert.equal(minimumCappedRewardsToMaster('advanced',24),2);
  assert.equal(minimumCappedRewardsToMaster('special',41),3);
  assert.equal(minimumCappedRewardsToMaster('special',50),0);
});

test('pacing profile exposes one canonical audit surface',()=>{
  assert.deepEqual(jobMasterPacingProfile('basic'),{
    tier:'basic',expShare:0.30,masteryLevel:15,levelsPerRewardCap:3,minimumCappedRewards:5,
  });
  const hero=jobMasterPacingProfile('hero');
  assert.equal(hero.masteryLevel,null);
  assert.equal(hero.minimumCappedRewards,null);
});

test('runtime still caps Job EXP after Character EXP is awarded',()=>{
  const core=fs.readFileSync(new URL('../js/patches/progression3Core.js',import.meta.url),'utf8');
  assert.match(core,/jobExpRewardCap\(beforeJob\.level/);
  assert.match(core,/Math\.min\(uncappedJobExp,rewardCap\)/);
  assert.match(core,/jobExpCapped:uncappedJobExp>rewardCap/);
});
