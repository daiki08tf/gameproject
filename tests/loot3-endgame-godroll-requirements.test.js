import test from 'node:test';
import assert from 'node:assert/strict';
import { loot3EndgameChase } from '../js/data/loot3EndgameChase.js';

const item={rarity:'mythic'};
const base={itemPower:9900,highestAffixRarity:'ancient',buildCount:1,greaterCount:1,legendary:null,targetFarmHit:false};

test('GOD ROLL requires ancient + build axis + greater at high IP',()=>{
  assert.equal(loot3EndgameChase(item,base).tier?.id,'godroll');
  assert.notEqual(loot3EndgameChase(item,{...base,highestAffixRarity:'mythic'}).tier?.id,'godroll');
  assert.notEqual(loot3EndgameChase(item,{...base,buildCount:0,legendary:null}).tier?.id,'godroll');
  assert.notEqual(loot3EndgameChase(item,{...base,greaterCount:0}).tier?.id,'godroll');
});
