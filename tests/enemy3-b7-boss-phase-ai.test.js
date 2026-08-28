import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENEMY3_BOSS_PHASE2,isEnemy3BossPhase2,enemy3BossPhaseStatMultiplier,shouldAdvanceBossCadence,advanceBossSpecialCadence } from '../js/data/enemy3BossPhaseAI.js';

test('B7 activates only for living Boss Phase 2 / <=50% HP',()=>{
  assert.equal(isEnemy3BossPhase2({boss:true,dead:false,aiPhase:2,hp:80,maxHp:100}),true);
  assert.equal(isEnemy3BossPhase2({boss:true,dead:false,aiPhase:1,hp:50,maxHp:100}),true);
  assert.equal(isEnemy3BossPhase2({boss:true,dead:false,aiPhase:1,hp:51,maxHp:100}),false);
  assert.equal(isEnemy3BossPhase2({boss:false,aiPhase:2,hp:10,maxHp:100}),false);
});

test('B7 phase stat pressure is bounded',()=>{
  const boss={boss:true,dead:false,aiPhase:2,hp:50,maxHp:100};
  assert.equal(ENEMY3_BOSS_PHASE2.atkMult,1.08);
  assert.equal(enemy3BossPhaseStatMultiplier(boss,'atk'),1.08);
  assert.equal(enemy3BossPhaseStatMultiplier(boss,'spd'),1.08);
  assert.equal(enemy3BossPhaseStatMultiplier(boss,'def'),1);
});

test('B7 cadence only advances every second actionable phase2 turn and never through telegraph',()=>{
  const boss={boss:true,dead:false,aiPhase:2,hp:40,maxHp:100,_enemy3BossPhaseActionCount:1,slamTurns:4,chargeTurns:1,projectileTurns:3,summonTurns:2,pendingSpecial:null};
  assert.equal(shouldAdvanceBossCadence(boss),false);
  boss._enemy3BossPhaseActionCount=2;
  assert.equal(shouldAdvanceBossCadence(boss),true);
  assert.deepEqual(advanceBossSpecialCadence(boss),['slamTurns','projectileTurns','summonTurns']);
  assert.equal(boss.slamTurns,3);assert.equal(boss.chargeTurns,1);assert.equal(boss.projectileTurns,2);assert.equal(boss.summonTurns,1);
  boss.pendingSpecial='slam';boss._enemy3BossPhaseActionCount=4;
  assert.equal(shouldAdvanceBossCadence(boss),false);
});

test('B7 runtime reuses authored Boss AI and avoids unrelated systems',()=>{
  const runtime=readFileSync(new URL('../js/patches/enemy3BossPhaseAI.js',import.meta.url),'utf8');
  const bridge=readFileSync(new URL('../js/patches/enemy3Targeting.js',import.meta.url),'utf8');
  assert.match(bridge,/import '\.\/enemy3BossPhaseAI\.js'/);
  assert.match(runtime,/authored Boss AI phase pressure/);
  assert.doesNotMatch(runtime,/gainGold|gainExp|addAbyssShards|genericElite|rareChance|WorldTier/);
});
