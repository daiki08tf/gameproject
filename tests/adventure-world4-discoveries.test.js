import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import '../js/patches/adventureWorld4DiscoveryRuntime.js';
import { normalizeAdventure4Discovery,adventure4RegionDiscoveryProgress,adventure4VisibleDiscoveries } from '../js/data/adventureWorld4Discoveries.js';

function reset(){state.data.adventure4=defaultAdventure4Session();state.data.world2={discoveries:{},flags:{},eventsSeen:{},eventChains:{}};state.data.stageProgress={};}

const catalog=Object.freeze([
  normalizeAdventure4Discovery({id:'gate',regionId:'frontier',category:'landmark',name:'古い門',major:true}),
  normalizeAdventure4Discovery({id:'tablet',regionId:'frontier',category:'ancient',name:'石板'}),
  normalizeAdventure4Discovery({id:'wolf',regionId:'frontier',category:'creature',name:'灰狼'}),
  normalizeAdventure4Discovery({id:'hidden-vault',regionId:'frontier',category:'secret',name:'隠された地下室'}),
]);

test('W7 supports the seven Discovery 4.0 categories',()=>{
  const categories=['landmark','lore','creature','civilization','ancient','anomaly','secret'];
  for(const category of categories)assert.equal(normalizeAdventure4Discovery({id:category,regionId:'frontier',category}).category,category);
});

test('W7 hides unknown Secret existence from visible totals',()=>{
  const progress=adventure4RegionDiscoveryProgress('frontier',catalog,{'gate':{name:'古い門'}});
  assert.equal(progress.visibleKnownCount,1);
  assert.equal(progress.visibleTotal,3);
  assert.equal(progress.label,'1/3件 記録');
  const visible=adventure4VisibleDiscoveries('frontier',catalog,{'gate':{name:'古い門'}});
  assert.equal(visible.some(item=>item.id==='hidden-vault'),false);
});

test('W7 reveals a Secret only after it is discovered without exposing it beforehand',()=>{
  const store={'gate':{name:'古い門'},'hidden-vault':{name:'隠された地下室'}};
  const progress=adventure4RegionDiscoveryProgress('frontier',catalog,store);
  assert.equal(progress.visibleTotal,4);
  assert.equal(progress.visibleKnownCount,2);
  assert.equal(adventure4VisibleDiscoveries('frontier',catalog,store).some(item=>item.id==='hidden-vault'),true);
});

test('W7 records discoveries into existing world2 authority and preserves legacy fields',()=>{
  reset();
  state.data.world2.discoveries.gate={name:'旧名の門',hint:'legacy hint',legacyField:42};
  state.startAdventure4({regionId:'frontier'});
  const result=state.recordAdventure4Discovery(catalog[0],{source:'scene:gate'});
  assert.equal(result.ok,true);
  assert.equal(result.new,false);
  assert.equal(state.data.world2.discoveries.gate.name,'旧名の門');
  assert.equal(state.data.world2.discoveries.gate.hint,'legacy hint');
  assert.equal(state.data.world2.discoveries.gate.legacyField,42);
  assert.equal(state.data.world2.discoveries.gate.regionId,'frontier');
  assert.equal(state.data.world2.discoveries.gate.category,'landmark');
  assert.deepEqual(state.adventure4Session().discoveredThisRun,['gate']);
});

test('W7 region completion combines Story and visible discovery progress only',()=>{
  reset();
  state.data.world2.discoveries.gate={name:'古い門'};
  state.data.world2.discoveries.tablet={name:'石板'};
  state.data.world2.discoveries.wolf={name:'灰狼'};
  const region={id:'frontier'};
  const completion=state.adventure4RegionCompletion(region,{clearedChapters:4,totalChapters:4},catalog);
  assert.equal(completion.story.complete,true);
  assert.equal(completion.discoveries.visibleTotal,3);
  assert.equal(completion.discoveries.visibleKnownCount,3);
  assert.equal(completion.recordedComplete,true);
  assert.doesNotMatch(completion.label,/secret|隠された地下室/i);
});
