import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PHASE13_CHALLENGES,PHASE13_TITLES,PHASE13_RARE_HUNTS,phase13BuildFeatIds } from '../js/data/phase13Replay.js';

test('Phase 13.1 provides optional challenge modifiers without a new currency',()=>{
  assert.deepEqual(PHASE13_CHALLENGES.map(x=>x.id),['none','iron_oath','glass_route','break_trial','boss_rematch_plus']);
  for(const c of PHASE13_CHALLENGES){assert.ok(c.rewardMult>=1);assert.ok(c.enemyHp>=1);assert.ok(c.enemyAtk>=1);}
  const src=fs.readFileSync(new URL('../js/data/phase13Replay.js',import.meta.url),'utf8');
  assert.doesNotMatch(src,/currency|token|coin/i);
});

test('Phase 13.4 rotating challenges are intentionally absent',()=>{
  const ids=PHASE13_CHALLENGES.map(x=>x.id).join(' ');
  assert.doesNotMatch(ids,/daily|weekly|rotate|rotation/);
  const runtime=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.doesNotMatch(runtime,/Date\(|setInterval|daily|weekly/i);
});

test('Phase 13.2 records turns damage hp and challenge wins through existing battle result',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.match(runtime,/bestTurns/);assert.match(runtime,/maxDamage/);assert.match(runtime,/bestHpPct/);assert.match(runtime,/challengeClears/);
  assert.match(runtime,/BattleEngine\.prototype\.advanceTurn/);
  const result=fs.readFileSync(new URL('../js/screens/result.js',import.meta.url),'utf8');
  assert.match(result,/CHALLENGE RECORD/);assert.match(result,/phase13/);
});

test('Phase 13.3 titles are prestige-only and persist through existing save',()=>{
  assert.ok(PHASE13_TITLES.length>=6);
  assert.ok(PHASE13_TITLES.some(x=>x.id==='rematcher'));
  assert.ok(PHASE13_TITLES.some(x=>x.id==='rare_tracker'));
  for(const t of PHASE13_TITLES){assert.equal('stats' in t,false);assert.equal('power' in t,false);}
  const runtime=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.save\(\)/);assert.match(runtime,/Challenge Records/);
});

test('Phase 13.5 REMATCH+ is a challenge modifier, not a duplicate boss menu',()=>{
  const rematch=PHASE13_CHALLENGES.find(x=>x.id==='boss_rematch_plus');
  assert.equal(rematch.rematch,true);assert.ok(rematch.enemyHp>1.3);assert.ok(rematch.rewardMult>=1.4);
  const runtime=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.isStageCleared/);assert.match(runtime,/bossLike/);
  assert.doesNotMatch(runtime,/goRematch|rematchScreen/);
});

test('Phase 13.6 adds five ultra-rare hunt variants to the existing horizontal dungeons',()=>{
  assert.equal(Object.keys(PHASE13_RARE_HUNTS).length,5);
  for(const [stageId,h] of Object.entries(PHASE13_RARE_HUNTS)){assert.ok(stageId.startsWith('secret-'));assert.ok(h.chance>0&&h.chance<=.01);assert.ok(h.sourceEnemyId);assert.ok(h.dropId);}
  const runtime=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.match(runtime,/injectRareHunt/);assert.match(runtime,/encounterQueue\.splice/);assert.match(runtime,/phase13RareHuntName/);
});

test('Phase 13.7 build challenges use existing equipment/job state',()=>{
  assert.deepEqual(phase13BuildFeatIds({bossLike:true,artifactCount:0,shield:false,mastered:true,challengeId:'boss_rematch_plus'}),['artifactless','shieldless','master_job','minimalist_rematch']);
  assert.deepEqual(phase13BuildFeatIds({bossLike:false,artifactCount:0,shield:false,mastered:true,challengeId:'boss_rematch_plus'}),[]);
});

test('Phase 13.8 integrates into existing confirm result and status surfaces',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/phase13ReplayRuntime.js',import.meta.url),'utf8');
  assert.match(runtime,/confirmModifiers/);assert.match(runtime,/statusContent/);assert.match(runtime,/overflow-x:auto/);
  const bridge=fs.readFileSync(new URL('../js/patches/phase12FinaleRuntime.js',import.meta.url),'utf8');
  assert.match(bridge,/phase13ReplayRuntime\.js/);
  assert.doesNotMatch(runtime,/homeScreen|goPhase13|phase13Screen/);
});
