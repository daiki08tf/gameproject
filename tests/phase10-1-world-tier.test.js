import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_TIERS, unlockedWorldTiers, highestWorldTier, worldTier } from '../js/data/worldTiers.js';
import { endgameRewardProfile } from '../js/data/endgameRewardScaling.js';
import { state } from '../js/state.js';
import { BattleEngine } from '../js/battleEngine.js';
import '../js/patches/worldTierRuntime.js';

test('World Tier has seven monotonic progression bands through Lv99,999',()=>{
  assert.equal(WORLD_TIERS.length,7);
  assert.deepEqual(WORLD_TIERS.map(t=>t.unlockLevel),[1,3000,9999,29999,49999,74999,99999]);
  for(let i=1;i<WORLD_TIERS.length;i++){
    assert.ok(WORLD_TIERS[i].enemyHp>WORLD_TIERS[i-1].enemyHp);
    assert.ok(WORLD_TIERS[i].enemyAtk>WORLD_TIERS[i-1].enemyAtk);
    assert.ok(WORLD_TIERS[i].reward>WORLD_TIERS[i-1].reward);
    assert.ok(WORLD_TIERS[i].drop>WORLD_TIERS[i-1].drop);
    assert.ok(WORLD_TIERS[i].eliteChance>WORLD_TIERS[i-1].eliteChance);
    assert.ok(WORLD_TIERS[i].aiHaste<WORLD_TIERS[i-1].aiHaste);
  }
  assert.equal(unlockedWorldTiers(3000).at(-1).id,'awakened');
  assert.equal(highestWorldTier(74999).id,'boundary_zero');
  assert.equal(highestWorldTier(99999).id,'beyond_boundary');
});

test('World Tier gating is level driven and selection persists in state data',()=>{
  assert.deepEqual(unlockedWorldTiers(1).map(t=>t.id),['normal']);
  assert.equal(unlockedWorldTiers(74998).some(t=>t.id==='boundary_zero'),false);
  assert.equal(unlockedWorldTiers(74999).some(t=>t.id==='boundary_zero'),true);
  assert.equal(unlockedWorldTiers(99998).some(t=>t.id==='beyond_boundary'),false);
  assert.equal(unlockedWorldTiers(99999).some(t=>t.id==='beyond_boundary'),true);
  assert.equal(highestWorldTier(99999).id,'beyond_boundary');

  const oldTier=state.data.worldTierId;
  try{
    assert.equal(state.setWorldTier('normal'),true);
    assert.equal(state.data.worldTierId,'normal');
    assert.equal(state.activeWorldTier().id,'normal');
  }finally{state.data.worldTierId=oldTier;}
});

test('World Tier runtime wraps BattleEngine combat without touching Abyss scaling',()=>{
  assert.equal(BattleEngine.prototype.__worldTierWrapped,true);
  assert.equal(typeof state.worldTierDropMult,'function');
  assert.equal(typeof state.worldTierItemPowerBonus,'function');
  assert.equal(state.worldTiers().length,7);
});

test('World VII extends the World V->VI tactical-stat step exactly, unlocking at the existing Lv99,999 cap',()=>{
  const vi=worldTier('boundary_zero'),vii=worldTier('beyond_boundary');
  assert.equal(vii.rank,6);
  assert.equal(vii.unlockLevel,99999);
  assert.equal(Math.round(vii.enemyHp/vi.enemyHp*100)/100,1.40,'same enemyHp step as World V->VI');
  assert.ok(vii.enemyAtk/vi.enemyAtk>1.21 && vii.enemyAtk/vi.enemyAtk<1.23,'same enemyAtk step as World V->VI');
  assert.ok(vii.enemyDef/vi.enemyDef>1.13 && vii.enemyDef/vi.enemyDef<1.15,'same enemyDef step as World V->VI');
  assert.equal(Math.round((vii.enemySpd-vi.enemySpd)*100)/100,.08,'same enemySpd step as World V->VI');
  assert.equal(Math.round((vii.eliteChance-vi.eliteChance)*100)/100,.07,'same eliteChance step as World V->VI');
  assert.equal(vii.aiHaste,1-.08*vii.rank,'aiHaste keeps the exact 1-0.08*rank formula every prior tier already followed');
});

test('World VII reward/drop/itemPowerBonus follow the shared endgame reward curve, not an independent extrapolation',()=>{
  const vii=worldTier('beyond_boundary');
  const milestone=endgameRewardProfile(vii.unlockLevel);
  assert.equal(vii.drop,milestone.drop);
  assert.equal(vii.reward,milestone.gold);
  assert.equal(vii.itemPowerBonus,milestone.itemPowerBonus);
});
