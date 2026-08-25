import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD3_EVENT_STAGES, world3EventStageByFlag } from '../js/data/world3EventStages.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';

test('three persistent World Event clues become playable branches',()=>{
  for(const flag of ['travelerBond','oldMap','beastTrail']){
    const stage=world3EventStageByFlag(flag);
    assert.ok(stage);
    assert.equal(stage.worldEventFlag,flag);
    assert.ok(stage.id.startsWith('secret-worldevent-'));
    assert.ok(stage.waves.length>0);
    assert.ok(stage.rewards.exp>0);
  }
});

test('World Event branch stages resolve through the existing secret-stage resolver',()=>{
  for(const stage of Object.values(WORLD3_EVENT_STAGES)){
    const resolved=buildSecretRealmStage(stage.id);
    assert.ok(resolved);
    assert.equal(resolved.id,stage.id);
    assert.equal(resolved.worldEventStage,true);
    assert.equal(resolved.worldEventFlag,stage.worldEventFlag);
  }
});
