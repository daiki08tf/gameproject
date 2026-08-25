import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOT3_CHASE_TIERS } from '../js/data/loot3EndgameChase.js';

test('endgame chase exports three completion labels',()=>assert.equal(LOOT3_CHASE_TIERS.length,3));
