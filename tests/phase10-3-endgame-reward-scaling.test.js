import test from 'node:test';
import assert from 'node:assert/strict';
import { ENDGAME_REWARD_MILESTONES, endgameRewardProfile } from '../js/data/endgameRewardScaling.js';
import { WORLD_TIERS } from '../js/data/worldTiers.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { abyssStageExpBudget } from '../js/data/abyssEndgame.js';
import { buildMachineWorldStage } from '../js/data/phase9MachineWorldStages.js';
import { BOUNTY2_STAGES } from '../js/data/bounty2.js';

test('unified endgame reward curve stays monotonic through Lv99999',()=>{
  for(let i=1;i<ENDGAME_REWARD_MILESTONES.length;i++){
    const lo=ENDGAME_REWARD_MILESTONES[i-1],hi=ENDGAME_REWARD_MILESTONES[i];
    assert.ok(hi.level>lo.level);
    assert.ok(hi.drop>=lo.drop);
    assert.ok(hi.gold>=lo.gold);
    assert.ok(hi.itemPowerBonus>=lo.itemPowerBonus);
  }
  const cap=endgameRewardProfile(99999);
  assert.equal(cap.drop,2.8);
  assert.equal(cap.gold,4.25);
  assert.equal(cap.itemPowerBonus,1250);
});

test('World Tier reward values align with the shared endgame milestones',()=>{
  for(const tier of WORLD_TIERS){
    const p=endgameRewardProfile(tier.unlockLevel);
    assert.equal(tier.drop,p.drop);
    assert.equal(tier.reward,p.gold);
    assert.equal(tier.itemPowerBonus,p.itemPowerBonus);
  }
});

test('Abyss gains intrinsic loot and gold chase value as depth rises',()=>{
  const depths=[1,100,500,1000,2000,3000];
  const stages=depths.map(d=>buildAbyssStage(d,[],{suppressModifiers:true}));
  for(let i=1;i<stages.length;i++){
    assert.ok(stages[i].dropMult>stages[i-1].dropMult);
    assert.ok(stages[i].rewards.gold>stages[i-1].rewards.gold);
  }
  assert.equal(stages.at(-1).endgameRewardProfile.drop,2.8);
});

test('derived Machine World stages suppress Abyss-era reward stacking',()=>{
  const raw=buildAbyssStage(2000,[],{suppressModifiers:true,suppressEndgameRewards:true});
  assert.equal(raw.dropMult,1);
  assert.equal(raw.endgameRewardProfile.drop,1);
  const machine=buildMachineWorldStage('machine-world-15');
  assert.ok(machine);
  assert.ok(machine.dropMult>1);
  assert.ok(machine.dropMult<3);
});

test('EX bounties inherit their Abyss-era reward floor instead of flat x2.5 rewards',()=>{
  const ex=BOUNTY2_STAGES.filter(s=>s.bounty2Tier==='ex');
  assert.equal(ex.length,5);
  for(const stage of ex){
    assert.ok(stage.endgameRewardProfile);
    assert.ok(stage.dropMult>1);
    assert.ok(stage.rewards.exp>=Math.round(abyssStageExpBudget(stage.bountyAbyssDepth)*1.35));
    const variant=BOUNTY2_STAGES.find(s=>s.id===`${stage.bountyBaseId}-variant`);
    assert.ok(stage.rewards.gold>variant.rewards.gold);
    assert.ok(stage.rewards.exp>variant.rewards.exp);
  }
});
