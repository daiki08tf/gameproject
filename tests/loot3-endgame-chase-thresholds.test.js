import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOT3_CHASE_TIERS } from '../js/data/loot3EndgameChase.js';

test('endgame chase thresholds stay monotonic and capped at IP9500+ for GOD ROLL',()=>{
  assert.deepEqual(LOOT3_CHASE_TIERS.map(t=>t.id),['endgame','apex','godroll']);
  assert.deepEqual(LOOT3_CHASE_TIERS.map(t=>t.minIp),[7000,8500,9500]);
  assert.ok(LOOT3_CHASE_TIERS[0].minScore<LOOT3_CHASE_TIERS[1].minScore);
  assert.ok(LOOT3_CHASE_TIERS[1].minScore<LOOT3_CHASE_TIERS[2].minScore);
});
