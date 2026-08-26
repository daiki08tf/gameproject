import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_TIERS, unlockedWorldTiers, highestWorldTier } from '../js/data/worldTiers.js';
import { state } from '../js/state.js';
import { BattleEngine } from '../js/battleEngine.js';
import '../js/patches/worldTierRuntime.js';

test('World Tier has six monotonic progression bands through Lv74,999+',()=>{
  assert.equal(WORLD_TIERS.length,6);
  assert.deepEqual(WORLD_TIERS.map(t=>t.unlockLevel),[1,3000,9999,29999,49999,74999]);
  for(let i=1;i<WORLD_TIERS.length;i++){
    assert.ok(WORLD_TIERS[i].enemyHp>WORLD_TIERS[i-1].enemyHp);
    assert.ok(WORLD_TIERS[i].enemyAtk>WORLD_TIERS[i-1].enemyAtk);
    assert.ok(WORLD_TIERS[i].reward>WORLD_TIERS[i-1].reward);
    assert.ok(WORLD_TIERS[i].drop>WORLD_TIERS[i-1].drop);
    assert.ok(WORLD_TIERS[i].eliteChance>WORLD_TIERS[i-1].eliteChance);
    assert.ok(WORLD_TIERS[i].aiHaste<WORLD_TIERS[i-1].aiHaste);
  }
  assert.equal(unlockedWorldTiers(3000).at(-1).id,'awakened');
  assert.equal(highestWorldTier(99999).id,'boundary_zero');
});

test('World Tier gating is level driven and selection persists in state data',()=>{
  assert.deepEqual(unlockedWorldTiers(1).map(t=>t.id),['normal']);
  assert.equal(unlockedWorldTiers(74998).some(t=>t.id==='boundary_zero'),false);
  assert.equal(unlockedWorldTiers(74999).some(t=>t.id==='boundary_zero'),true);
  assert.equal(highestWorldTier(99999).id,'boundary_zero');

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
  assert.equal(state.worldTiers().length,6);
});
