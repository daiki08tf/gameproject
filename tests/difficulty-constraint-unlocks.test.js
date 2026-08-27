import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PHASE13_CHALLENGE_UNLOCKS,phase13ChallengeAvailability } from '../js/data/phase13Replay.js';

test('normal is always available while replay conditions unlock at canonical story milestones',()=>{
  assert.deepEqual(Object.fromEntries(Object.entries(PHASE13_CHALLENGE_UNLOCKS).map(([id,x])=>[id,x.chapter])),{
    none:0,iron_oath:5,glass_route:10,break_trial:19,boss_rematch_plus:25,
  });
  assert.equal(phase13ChallengeAvailability('none',{clearedChapter:0}).available,true);
  assert.equal(phase13ChallengeAvailability('iron_oath',{clearedChapter:4,stageCleared:true}).available,false);
  assert.equal(phase13ChallengeAvailability('iron_oath',{clearedChapter:5,stageCleared:true}).available,true);
  assert.equal(phase13ChallengeAvailability('glass_route',{clearedChapter:9,stageCleared:true}).available,false);
  assert.equal(phase13ChallengeAvailability('glass_route',{clearedChapter:10,stageCleared:true}).available,true);
  assert.equal(phase13ChallengeAvailability('break_trial',{clearedChapter:18,stageCleared:true}).available,false);
  assert.equal(phase13ChallengeAvailability('break_trial',{clearedChapter:19,stageCleared:true}).available,true);
});

test('all non-normal conditions require a first clear of the target stage',()=>{
  for(const id of ['iron_oath','glass_route','break_trial','boss_rematch_plus']){
    assert.equal(PHASE13_CHALLENGE_UNLOCKS[id].requiresStageClear,true,id);
    assert.equal(phase13ChallengeAvailability(id,{clearedChapter:30,stageCleared:false,bossLike:true}).available,false,id);
  }
  assert.equal(phase13ChallengeAvailability('break_trial',{clearedChapter:30,stageCleared:true}).available,true);
});

test('REMATCH+ additionally requires Ch25 observation capability and boss-like content',()=>{
  assert.equal(PHASE13_CHALLENGE_UNLOCKS.boss_rematch_plus.capability,'観測条件');
  assert.equal(phase13ChallengeAvailability('boss_rematch_plus',{clearedChapter:24,stageCleared:true,bossLike:true}).available,false);
  assert.equal(phase13ChallengeAvailability('boss_rematch_plus',{clearedChapter:25,stageCleared:true,bossLike:false}).available,false);
  assert.equal(phase13ChallengeAvailability('boss_rematch_plus',{clearedChapter:25,stageCleared:true,bossLike:true}).available,true);
});

test('unlock fiction escalates from battle records to boundary and observation conditions',()=>{
  assert.equal(PHASE13_CHALLENGE_UNLOCKS.iron_oath.capability,'戦闘記録');
  assert.equal(PHASE13_CHALLENGE_UNLOCKS.glass_route.capability,'上級戦闘記録');
  assert.equal(PHASE13_CHALLENGE_UNLOCKS.break_trial.capability,'境界条件');
  assert.equal(PHASE13_CHALLENGE_UNLOCKS.boss_rematch_plus.capability,'観測条件');
});

test('runtime enforces locks rather than merely hiding buttons',()=>{
  const src=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.match(src,/challengeAvailability\(stageOrId,id\)/);
  assert.match(src,/availability\.available\?availability\.challenge\.id:'none'/);
  assert.match(src,/selectedChallenges\.delete\(stageId\)/);
  assert.match(src,/state\.isStageCleared/);
  assert.match(src,/finalStageOf/);
  assert.match(src,/selectedPhase13Challenge\(engine\.stage\)/);
  assert.match(src,/selectedPhase13Challenge\(stage\)/);
});

test('early-game confirm UI stays clean and future conditions are not listed as disabled clutter',()=>{
  const src=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.match(src,/if\(!globallyUnlocked\.length\)return/);
  assert.match(src,/このステージを一度クリアすると/);
  assert.match(src,/PHASE13_CHALLENGES\.filter\(c=>challengeAvailability\(stage,c\.id\)\.available\)/);
  assert.doesNotMatch(src,/disabled.*PHASE13_CHALLENGES|PHASE13_CHALLENGES.*disabled/s);
});

test('redesign adds no screen currency rotation or new save root',()=>{
  const data=fs.readFileSync(new URL('../js/data/phase13Replay.js',import.meta.url),'utf8');
  const runtime=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.doesNotMatch(data,/daily|weekly|rotation|token|coin|currency/i);
  assert.doesNotMatch(runtime,/goDifficulty|difficultyScreen|goChallenge|challengeScreen|Date\(|setInterval/i);
  assert.doesNotMatch(runtime,/state\.data\.(difficulty|challengeUnlock|constraintUnlock)/);
});
