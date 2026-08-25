import test from 'node:test';
import assert from 'node:assert/strict';
import { loot3EndgameChase } from '../js/data/loot3EndgameChase.js';

const item={rarity:'mythic'};
test('high IP alone is not a god roll',()=>{
  const c=loot3EndgameChase(item,{itemPower:9900,highestAffixRarity:'legendary',buildCount:0,greaterCount:0,legendary:null,targetFarmHit:false});
  assert.notEqual(c.tier?.id,'godroll');
});
test('ancient build greater combination can become GOD ROLL',()=>{
  const c=loot3EndgameChase(item,{itemPower:9900,highestAffixRarity:'ancient',buildCount:1,greaterCount:1,legendary:{id:'x'},targetFarmHit:true});
  assert.equal(c.tier?.id,'godroll');
  assert.ok(c.signals.includes('ANCIENT'));
  assert.ok(c.signals.includes('BUILD'));
});
test('strong but incomplete combinations land in apex chase',()=>{
  const c=loot3EndgameChase(item,{itemPower:9000,highestAffixRarity:'ancient',buildCount:1,greaterCount:0,legendary:null,targetFarmHit:false});
  assert.equal(c.tier?.id,'apex');
});
