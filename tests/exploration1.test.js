import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPLORATION_SITES, explorationProgressFor } from '../js/data/exploration1.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { findStage } from '../js/data/stages.js';

test('Exploration includes four Secret Realms plus blood gate and seven-key mystery',()=>{
  assert.equal(EXPLORATION_SITES.length,6);
  for(const id of ['blood_gate','ancient_dragon_gate','sealed_library','god_grave','void_corridor','seven_seal_gate']) assert.ok(EXPLORATION_SITES.some(x=>x.id===id));
  assert.ok(EXPLORATION_SITES.some(x=>x.id==='seven_seal_gate'&&x.fragmentsRequired===7));
});

test('blood gate progresses hidden -> discovered -> clued -> unlocked',()=>{
  const site=EXPLORATION_SITES.find(x=>x.id==='blood_gate');
  assert.equal(explorationProgressFor(site,326,{}).state,'hidden');
  assert.equal(explorationProgressFor(site,327,{}).state,'discovered');
  assert.equal(explorationProgressFor(site,420,{}).state,'clued');
  assert.equal(explorationProgressFor(site,800,{}).state,'unlocked');
  assert.equal(explorationProgressFor(site,800,{}).fragments,3);
});

test('manual inspection reveals clues without handing out missing fragments',()=>{
  const site=EXPLORATION_SITES.find(x=>x.id==='blood_gate');
  const p=explorationProgressFor(site,350,{inspected:true});
  assert.equal(p.state,'clued');assert.equal(p.fragments,0);assert.equal(p.unlocked,false);
});

test('expanded sites each require three clues and unlock at their final source depth',()=>{
  for(const id of ['ancient_dragon_gate','sealed_library','god_grave','void_corridor']){
    const site=EXPLORATION_SITES.find(x=>x.id===id);assert.equal(site.fragmentsRequired,3);assert.equal(explorationProgressFor(site,site.discoverDepth-1,{}).state,'hidden');assert.equal(explorationProgressFor(site,site.discoverDepth,{}).state,'discovered');const final=site.fragmentSources.at(-1),p=explorationProgressFor(site,final,{});assert.equal(p.state,'unlocked');assert.equal(p.fragments,3);
  }
});

test('all Secret Realms are playable and have targeted set loot',()=>{
  const expected={'secret-blood-castle':'set_blood_','secret-ancient-dragon-nest':'set_dragon_','secret-sealed-library':'set_star_','secret-gods-graveyard':'set_executioner_','secret-void-corridor':'set_abyss_'};
  for(const [id,prefix] of Object.entries(expected)){const stage=buildSecretRealmStage(id);assert.ok(stage,id);assert.equal(stage.secretRealm,true);assert.equal(stage.isAbyss,false);assert.ok(stage.dropTable.some(x=>String(x.itemId).startsWith(prefix)),`${id} targeted loot`);const found=findStage(id);assert.ok(found);assert.equal(found.chapter,null);assert.equal(found.stage.id,id);}
});

test('late Secret Realms form a clear power ladder',()=>{
  const ids=['secret-blood-castle','secret-ancient-dragon-nest','secret-sealed-library','secret-gods-graveyard','secret-void-corridor'],stages=ids.map(buildSecretRealmStage);
  for(let i=1;i<stages.length;i++){assert.ok(stages[i].recLevel>stages[i-1].recLevel);assert.ok(stages[i].itemPowerTarget>stages[i-1].itemPowerTarget);}
  assert.equal(stages.at(-1).recLevel,99999);assert.equal(stages.at(-1).itemPowerTarget,10000);
});
