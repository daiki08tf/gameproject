import test from 'node:test';
import assert from 'node:assert/strict';
import { AWAKENING_V2_RANKS, evaluateAwakeningRequirements } from '../js/data/awakeningMilestones.js';

test('Awakening 3.0 uses the formal Lv90/300/700/3000 milestones',()=>{
  assert.deepEqual(AWAKENING_V2_RANKS.map(r=>r.requirements.characterLevel),[90,300,700,3000]);
  assert.deepEqual(AWAKENING_V2_RANKS.map(r=>r.rank),[1,2,3,4]);
  for(const rank of AWAKENING_V2_RANKS) assert.ok(rank.unlocks.some(x=>x.includes(`Rank${rank.rank}`)));
});

test('Fourth Awakening is the Chapter 20 / Lv3000 breakpoint, not an Abyss grind gate',()=>{
  const rank4=AWAKENING_V2_RANKS.find(r=>r.rank===4);
  assert.equal(rank4.requirements.characterLevel,3000);
  assert.equal(rank4.requirements.clearedStage,'20-5');
  assert.equal(rank4.requirements.abyssDepth,undefined);
  assert.equal(rank4.requirements.rune2OwnedTotal,undefined);
  const result=evaluateAwakeningRequirements(rank4,{
    characterLevel:3000,
    masteredJobs:40,
    abyssDepth:0,
    rune2OwnedTotal:0,
    isStageCleared:id=>id==='20-5',
  });
  assert.equal(result.met,true);
});
