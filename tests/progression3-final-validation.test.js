import test from 'node:test';
import assert from 'node:assert/strict';
import { cumulativeCharacterExpToLevel, characterExpToNext, CHARACTER_LEVEL_MAX } from '../js/data/progression.js';
import { jobExpRewardCap, JOB_LEVELS_PER_REWARD_CAP } from '../js/data/progression3.js';
import { ABYSS_ENDGAME_MILESTONES, abyssRecommendedLevel } from '../js/data/abyssEndgame.js';

test('Lv99,999 cumulative EXP remains a safe integer',()=>{
  const total=cumulativeCharacterExpToLevel(CHARACTER_LEVEL_MAX);
  assert.ok(Number.isSafeInteger(total));
  assert.ok(total>0);
  assert.equal(characterExpToNext(CHARACTER_LEVEL_MAX),0);
});

test('Abyss roadmap is monotonic through Lv99,999',()=>{
  let last=0;
  for(const m of ABYSS_ENDGAME_MILESTONES){
    assert.ok(m.level>=last);
    assert.equal(abyssRecommendedLevel(m.depth),m.level);
    last=m.level;
  }
  assert.equal(last,CHARACTER_LEVEL_MAX);
});

test('Job EXP per reward is capped to three level costs',()=>{
  const expToNext=(lv)=>100+lv*10;
  const cap=jobExpRewardCap(20,expToNext);
  assert.equal(JOB_LEVELS_PER_REWARD_CAP,3);
  assert.equal(cap,expToNext(20)+expToNext(21)+expToNext(22));
});
