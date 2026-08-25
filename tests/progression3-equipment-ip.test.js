import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_ITEM_POWER, inferChapterNumber, itemPowerForDrop, affixTierForItemPower } from '../js/data/equipment3.js';

test('The Veil chapters bridge item power from story into Abyss 1F',()=>{
  assert.deepEqual(CHAPTER_ITEM_POWER[15],[930,1000]);
  assert.deepEqual(CHAPTER_ITEM_POWER[16],[1000,1350]);
  assert.deepEqual(CHAPTER_ITEM_POWER[20],[2500,3000]);
  assert.equal(inferChapterNumber({id:'ch20_test_blade'}),20);
});

test('chapter 16-20 drops can progress beyond legacy IP1000 cap',()=>{
  const item={id:'ch20_test_blade'};
  const values=Array.from({length:64},(_,i)=>itemPowerForDrop(item,{chapter:20},`veil-${i}`));
  assert.ok(values.some(v=>v>2500));
  assert.ok(values.every(v=>v>=2500&&v<=3000));
});

test('Chapter 20 and Abyss entry share the same affix tier boundary',()=>{
  assert.equal(affixTierForItemPower(1000),1);
  assert.equal(affixTierForItemPower(1001),2);
  assert.equal(affixTierForItemPower(3000),3);
});
