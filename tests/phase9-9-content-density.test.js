import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import '../js/patches/phase9RegionalExplorationRuntime.js';

test('Phase 9.9 gives all 15 regional routes a repeatable farm identity',()=>{
  for(let num=21;num<=25;num++){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    const routes=chapter.stages.filter(s=>s.phase9Exploration).sort((a,b)=>a.phase9ExplorationIndex-b.phase9ExplorationIndex);
    assert.equal(routes.length,3);
    for(const route of routes){
      assert.equal(route.phase9DensityPass,'9.9');
      assert.equal(route.phase9Repeatable,true);
      assert.ok(route.phase9FarmIdentity);
      assert.ok(route.rewards.gold>0&&route.rewards.exp>0);
      assert.ok(route.dropMult>0);
      assert.ok(route.itemPowerTarget>0&&route.itemPowerTarget<=10000);
    }
    const loot=routes.find(r=>r.phase9ExplorationKind==='loot');
    assert.ok(loot);
    assert.equal(loot.dropMult,Math.max(...routes.map(r=>r.dropMult)));
  }
});

test('regional route rewards scale from nearby story gates instead of tiny fixed rewards',()=>{
  for(let num=21;num<=25;num++){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    for(const route of chapter.stages.filter(s=>s.phase9Exploration)){
      const source=chapter.stages.find(s=>s.id===route.phase9RewardAnchorId);
      assert.ok(source,`${route.id} reward anchor`);
      assert.ok(route.rewards.gold>=source.rewards.gold);
      assert.ok(route.rewards.exp>=source.rewards.exp);
      assert.ok(route.itemPowerTarget>(source.itemPowerTarget||source.recLevel||0));
    }
  }
});

test('regional hidden bosses become meaningful repeatable apex farms',()=>{
  for(let num=21;num<=25;num++){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    const storyBoss=chapter.stages.find(s=>s.boss&&!s.branch);
    const hidden=chapter.stages.find(s=>s.id===`${num}-B`);
    assert.ok(storyBoss&&hidden);
    assert.equal(hidden.phase9DensityPass,'9.9');
    assert.equal(hidden.phase9Repeatable,true);
    assert.ok(hidden.phase9FarmIdentity);
    assert.ok(hidden.phase9RegionalApexReward);
    assert.ok(hidden.rewards.gold>storyBoss.rewards.gold);
    assert.ok(hidden.rewards.exp>storyBoss.rewards.exp);
    assert.ok(hidden.dropMult>(storyBoss.dropMult||1));
    assert.ok(hidden.itemPowerTarget>(storyBoss.itemPowerTarget||storyBoss.recLevel||0));
  }
});

test('Phase 9.9 preserves the exploration chain and hidden-boss gate',()=>{
  for(let num=21;num<=25;num++){
    const chapter=CHAPTERS.find(ch=>ch.num===num);
    const routes=chapter.stages.filter(s=>s.phase9Exploration).sort((a,b)=>a.phase9ExplorationIndex-b.phase9ExplorationIndex);
    assert.equal(routes[1].requires,routes[0].id);
    assert.equal(routes[2].requires,routes[1].id);
    const hidden=chapter.stages.find(s=>s.id===`${num}-B`);
    assert.equal(hidden.requires,routes[2].id);
  }
});
