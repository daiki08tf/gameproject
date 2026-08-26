import test from 'node:test';
import assert from 'node:assert/strict';
import { BattleEngine } from '../js/battleEngine.js';
import '../js/patches/battleRewardAccountingFix.js';

test('raw damage clamps lethal enemy HP to zero and marks it dead',()=>{
  const engine=Object.create(BattleEngine.prototype);
  engine.defeated=0;
  const enemy={id:'test',hp:3,dead:false};
  engine._applyRawDamage(enemy,9);
  assert.equal(enemy.hp,0);
  assert.equal(enemy.dead,true);
  assert.equal(engine.defeated,1);
});

test('reconciliation repairs a zero-HP enemy left alive by an extension path',()=>{
  const engine=Object.create(BattleEngine.prototype);
  engine.defeated=4;
  engine.enemies=[{id:'stale',name:'stale enemy',hp:0,dead:false,_rewardsGranted:false}];
  let rewards=0;
  engine._grantKillRewards=(enemy)=>{rewards++;enemy._rewardsGranted=true;return{};};
  const repaired=engine._reconcileZeroHpEnemies();
  assert.deepEqual(repaired,['stale']);
  assert.equal(engine.enemies[0].dead,true);
  assert.equal(engine.enemies[0].hp,0);
  assert.equal(engine.defeated,5);
  assert.equal(rewards,1);
});

test('reconciliation never double-counts or double-rewards an already defeated enemy',()=>{
  const engine=Object.create(BattleEngine.prototype);
  engine.defeated=7;
  engine.enemies=[{id:'dead',hp:0,dead:true,_rewardsGranted:true}];
  let rewards=0;
  engine._grantKillRewards=()=>{rewards++;};
  assert.deepEqual(engine._reconcileZeroHpEnemies(),[]);
  assert.equal(engine.defeated,7);
  assert.equal(rewards,0);
});
