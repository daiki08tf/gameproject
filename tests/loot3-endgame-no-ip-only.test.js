import test from 'node:test';
import assert from 'node:assert/strict';
import { loot3EndgameChase } from '../js/data/loot3EndgameChase.js';

test('IP10000 alone is insufficient for GOD ROLL',()=>{
  const c=loot3EndgameChase({rarity:'mythic'},{itemPower:10000,highestAffixRarity:'rare',buildCount:0,greaterCount:0,legendary:null,targetFarmHit:false});
  assert.notEqual(c.tier?.id,'godroll');
});
