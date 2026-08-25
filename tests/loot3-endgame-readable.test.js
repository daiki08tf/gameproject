import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOT3_CHASE_TIERS } from '../js/data/loot3EndgameChase.js';

test('chase labels remain player-facing and distinct',()=>{
  assert.deepEqual(LOOT3_CHASE_TIERS.map(t=>t.label),['ENDGAME PIECE','APEX DROP','GOD ROLL']);
});
