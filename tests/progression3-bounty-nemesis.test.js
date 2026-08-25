import test from 'node:test';
import assert from 'node:assert/strict';
import { BOUNTY2_STAGES } from '../js/data/bounty2.js';
import { abyssRecommendedLevel, abyssTargetItemPower } from '../js/data/abyssEndgame.js';

test('EX bounties span the Abyss endgame eras',()=>{
  const ex=BOUNTY2_STAGES.filter(s=>s.bounty2Tier==='ex');
  assert.equal(ex.length,5);
  const depths=[1,100,500,1000,2000];
  assert.deepEqual(ex.map(s=>s.bountyAbyssDepth),depths);
  for(const stage of ex){
    assert.equal(stage.recLevel,abyssRecommendedLevel(stage.bountyAbyssDepth));
    assert.equal(stage.itemPowerTarget,abyssTargetItemPower(stage.bountyAbyssDepth));
    assert.ok(stage.bountyEra);
  }
});

test('variant bounties remain chapter-side stepping stones',()=>{
  const variants=BOUNTY2_STAGES.filter(s=>s.bounty2Tier==='variant');
  assert.equal(variants.length,5);
  for(const stage of variants){
    assert.equal(stage.bountyAbyssDepth,null);
    assert.equal(stage.itemPowerTarget,null);
    assert.ok(stage.recLevel<3000);
  }
});
