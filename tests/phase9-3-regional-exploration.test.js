import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { PHASE9_REGIONAL_EXPLORATION } from '../js/data/phase9RegionalExploration.js';
import '../js/patches/phase9RegionalExplorationRuntime.js';

test('Phase 9.3 gives every chapter 21-25 three authored exploration routes',()=>{
  for(let num=21;num<=25;num++){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    assert.ok(chapter);
    const routes=chapter.stages.filter(s=>s.phase9Exploration);
    assert.equal(routes.length,3,`chapter ${num}`);
    assert.equal(new Set(routes.map(s=>s.phase9ExplorationId)).size,3);
    for(const route of routes){
      assert.ok(route.phase9Description);
      assert.ok(route.phase9RewardTag);
      assert.ok(route.waves.length>=2);
      assert.ok(route.dropTable.length>=1);
    }
  }
});

test('regional routes form a discovery chain into the hidden boss',()=>{
  for(let num=21;num<=25;num++){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    const routes=chapter.stages.filter(s=>s.phase9Exploration).sort((a,b)=>a.phase9ExplorationIndex-b.phase9ExplorationIndex);
    assert.equal(routes[1].requires,routes[0].id);
    assert.equal(routes[2].requires,routes[1].id);
    const hidden=chapter.stages.find(s=>s.id===`${num}-B`);
    assert.ok(hidden?.phase9HiddenBoss);
    assert.equal(hidden.requires,routes[2].id);
    assert.deepEqual(hidden.phase9ExplorationChain,routes.map(r=>r.id));
  }
});

test('regional exploration definitions stay aligned with Region Identity 9.1',()=>{
  assert.deepEqual(Object.keys(PHASE9_REGIONAL_EXPLORATION),['ch21','ch22','ch23','ch24','ch25']);
  for(const def of Object.values(PHASE9_REGIONAL_EXPLORATION)){
    assert.equal(def.routes.length,3);
    assert.ok(def.reward);
    assert.equal(new Set(def.routes.map(r=>r.rewardTag)).size,3);
  }
});
