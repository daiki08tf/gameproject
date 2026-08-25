import test from 'node:test';
import assert from 'node:assert/strict';
import { equipment3Presentation, equipment3DropHeadline, equipment3SpecialLines } from '../js/data/equipment3Presentation.js';

const item={name:'神話剣',rarity:'mythic',slot:'weapon'};
test('presentation surfaces GOD ROLL as a chase label, not a rarity',()=>{
  const p=equipment3Presentation(item,{itemPower:9900,affixTier:10,greaterAffixCount:1,legendaryEffectId:'thunderheart',affixes:[{id:'build_bloodedge',rarity:'ancient',roll:28,greater:true}]});
  assert.equal(p.chase.tier.id,'godroll');
  assert.equal(item.rarity,'mythic');
  assert.equal(equipment3DropHeadline(p),'――GOD ROLL――');
  assert.ok(equipment3SpecialLines(p).some(line=>line.includes('CHASE：GOD ROLL')));
});
