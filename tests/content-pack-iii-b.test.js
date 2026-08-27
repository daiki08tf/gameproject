import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getItem } from '../js/data/equipment.js';
import { CP3_SECRET_CHAINS,CP3_HIDDEN_BOSSES,CP3_SECRET_COMPANIONS,CP3_SPECIAL_HYBRIDS,CP3_REWARDS,CP3_CHAIN_LORE,cp3ChainProgress,cp3HybridFor } from '../js/data/contentPackIIIB.js';

const dataSource=fs.readFileSync(new URL('../js/data/contentPackIIIB.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../js/patches/contentPackIIIB.js',import.meta.url),'utf8');
const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');

test('CP3-B ships one cohesive convergence batch',()=>{
  assert.equal(Object.keys(CP3_SECRET_CHAINS).length,3);
  assert.equal(Object.keys(CP3_HIDDEN_BOSSES).length,5);
  assert.equal(Object.keys(CP3_SECRET_COMPANIONS).length,6);
  assert.equal(Object.keys(CP3_SPECIAL_HYBRIDS).length,3);
  assert.equal(CP3_REWARDS.length,12);
  assert.equal(Object.keys(CP3_CHAIN_LORE).length,3);
});

test('CP3-B chains are ordered discovery contracts',()=>{
  for(const chain of Object.values(CP3_SECRET_CHAINS)){
    assert.ok(chain.steps.length>=2);
    const discoveries={};
    let p=cp3ChainProgress(chain,{discoveries});
    assert.equal(p.completed,0);assert.equal(p.resolved,false);
    for(let i=0;i<chain.steps.length;i++){
      discoveries[chain.steps[i].discoveryId]={};
      p=cp3ChainProgress(chain,{discoveries});
      assert.equal(p.completed,i+1);
    }
    assert.equal(p.resolved,true);
  }
});

test('CP3-B bosses reuse old regions and resolve to valid chains/rewards',()=>{
  const allowedStages=new Set(['21-8','23-8','24-8']);
  for(const[id,boss]of Object.entries(CP3_HIDDEN_BOSSES)){
    assert.ok(allowedStages.has(boss.stageId),`${id} escaped old-region revisit scope`);
    assert.ok(CP3_SECRET_CHAINS[boss.chainId],`missing chain ${boss.chainId}`);
    assert.ok(boss.hpMult>1&&boss.atkMult>1);
    for(const itemId of boss.rewards||[])assert.ok(getItem(itemId),`unregistered CP3 reward ${itemId}`);
  }
});

test('CP3-B relic catalog is finite, unique and equipment-valid',()=>{
  const ids=CP3_REWARDS.map(x=>x.id);assert.equal(new Set(ids).size,ids.length);
  const slots=new Set(['weapon','shield','head','body','accessory']);
  for(const item of CP3_REWARDS){
    assert.ok(slots.has(item.slot));assert.ok(['legendary','mythic'].includes(item.rarity));
    for(const value of Object.values(item.stats||{}))assert.ok(Number.isFinite(value));
    assert.equal(getItem(item.id)?.id,item.id);
  }
});

test('CP3-B special breeding is deterministic by parent pair after chain unlock',()=>{
  assert.equal(cp3HybridFor('cp3_reply_hound','cp3_backtrace_wisp')?.id,'cp3_target_hound');
  assert.equal(cp3HybridFor('cp3_backtrace_wisp','cp3_reply_hound')?.id,'cp3_target_hound');
  assert.equal(cp3HybridFor('cp3_memory_sprout','cp3_archive_moth')?.id,'cp3_living_bloom');
  assert.match(runtime,/const result=previous\(aId,bId,rng\)/);
  assert.match(runtime,/egg\.origin='cp3SpecialBreeding'/);
});

test('CP3-B preserves battle density and boot ordering',()=>{
  assert.match(runtime,/Object\.entries\(CP3_HIDDEN_BOSSES\)\.find/,'only one eligible CP3-B boss should be selected per run');
  assert.match(runtime,/encounterQueue\.push\(\{type:id,count:1\}\)/);
  const a=home.indexOf("import './contentPackIIIA.js';"),b=home.indexOf("import './contentPackIIIB.js';");
  assert.ok(a>=0&&b>a,'CP3-A must boot before CP3-B');
});

test('CP3-B keeps Modern World identity restrained and avoids system sprawl',()=>{
  assert.doesNotMatch(dataSource,/日本|東京|Japan|Tokyo|Earth/);
  assert.doesNotMatch(dataSource+runtime,/daily|weekly|new currency|goCP3|cp3Screen/i);
  assert.match(dataSource,/機械.*欠落|機械記録に欠落|機械では記録できない/);
});
