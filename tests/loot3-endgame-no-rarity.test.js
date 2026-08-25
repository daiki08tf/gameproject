import test from 'node:test';
import assert from 'node:assert/strict';
import { equipment3Presentation } from '../js/data/equipment3Presentation.js';

test('chase labels never overwrite base item rarity',()=>{
  const item={name:'test',rarity:'mythic',slot:'weapon'};
  const p=equipment3Presentation(item,{itemPower:9900,affixTier:10,greaterAffixCount:1,legendaryEffectId:'thunderheart',affixes:[{id:'build_bloodedge',rarity:'ancient',roll:28,greater:true}]});
  assert.equal(item.rarity,'mythic');
  assert.equal(p.chase.tier.id,'godroll');
});
