import test from 'node:test';
import assert from 'node:assert/strict';
import { BOUNTY_UNIQUES, uniqueForBounty } from '../js/data/uniqueEquipment.js';
import { BOUNTIES, buildBountyStage } from '../js/data/bounties.js';
import { getItem } from '../js/data/equipment.js';

test('each initial bounty has exactly one registered unique reward', () => {
  assert.equal(BOUNTIES.length, 5);
  const bountyRewards=BOUNTY_UNIQUES.filter(u=>u.bountyId);
  assert.equal(bountyRewards.length, 5);
  for (const bounty of BOUNTIES) {
    const unique = uniqueForBounty(bounty.id);
    assert.ok(unique, `missing unique for ${bounty.id}`);
    assert.equal(unique.unique, true);
    assert.equal(getItem(unique.id)?.id, unique.id);
  }
});

test('non-bounty fixed Uniques can coexist without changing bounty reward mapping',()=>{
  const extra=BOUNTY_UNIQUES.filter(u=>!u.bountyId);
  assert.ok(extra.every(u=>u.unique&&getItem(u.id)?.id===u.id));
});

test('bounty stages remain hidden-content stages with combat hints', () => {
  for (const bounty of BOUNTIES) {
    const stage = buildBountyStage(bounty);
    assert.equal(stage.bounty, true);
    assert.equal(stage.requires, bounty.requires);
    assert.ok(stage.bountyGimmick.length > 10);
    assert.ok(stage.bountyRewardHint.length > 5);
    assert.equal(stage.waves.length, 1);
  }
});

test('unique weapons use fixed definitions rather than weapon affix instances', () => {
  const gram = getItem('uq_bloodfang_gram');
  const regicide = getItem('uq_regicide');
  assert.equal(gram.weaponType, 'sword');
  assert.ok(gram.effects.some(e => e.kind === 'highHpDoubleAttack'));
  assert.ok(regicide.effects.some(e => e.kind === 'bossDmg' && e.power === 0.5));
  assert.ok(regicide.effects.some(e => e.kind === 'normalEnemyDmgPenalty'));
});
