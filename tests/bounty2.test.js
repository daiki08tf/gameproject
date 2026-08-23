import test from 'node:test';
import assert from 'node:assert/strict';
import { BOUNTIES } from '../js/data/bounties.js';
import { BOUNTY2_STAGES, bounty2StageById } from '../js/data/bounty2.js';

test('each base bounty has one variant and one EX hunt',()=>{
  assert.equal(BOUNTY2_STAGES.length,BOUNTIES.length*2);
  for(const bounty of BOUNTIES){
    const variant=bounty2StageById(`${bounty.id}-variant`);
    const ex=bounty2StageById(`${bounty.id}-ex`);
    assert.ok(variant);
    assert.ok(ex);
    assert.equal(variant.requires,bounty.id);
    assert.equal(ex.requires,variant.id);
    assert.equal(variant.bountyBaseId,bounty.id);
    assert.equal(ex.bountyBaseId,bounty.id);
    assert.equal(ex.bountyRank,'EX');
    assert.ok(variant.recLevel>bounty.recLevel);
    assert.ok(ex.recLevel>variant.recLevel);
  }
});

test('EX hunts are materially stronger than variant hunts',()=>{
  for(const bounty of BOUNTIES){
    const variant=bounty2StageById(`${bounty.id}-variant`);
    const ex=bounty2StageById(`${bounty.id}-ex`);
    assert.ok(ex.bounty2Scale.hp>variant.bounty2Scale.hp);
    assert.ok(ex.bounty2Scale.atk>variant.bounty2Scale.atk);
    assert.ok(ex.rewards.exp>variant.rewards.exp);
    assert.ok(ex.rewards.gold>variant.rewards.gold);
  }
});
