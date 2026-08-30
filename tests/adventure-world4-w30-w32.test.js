import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WORLD3_REGIONS } from '../js/data/world3Regions.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';
import { adventure4HorizontalGearCatalog,adventure4HorizontalGearByActivity } from '../js/data/adventureWorld4HorizontalGear.js';
import { ADVENTURE4_CONTENT_PACK_II_EVENTS,ADVENTURE4_CONTENT_PACK_II_SCENES,adventure4ContentPackIIForRegion } from '../js/data/adventureWorld4ContentPackII.js';
import { validateAdventure4Scene } from '../js/data/adventureWorld4Scenes.js';
import { adventure4ExplorationRecords,adventure4ExplorationRecordSummary } from '../js/data/adventureWorld4WorldRecords.js';
import { SETTLEMENT_CHRONICLE_EXHIBITS } from '../js/data/settlementChronicle.js';

test('W30 horizontal gear is a read-only view over existing canonical Unique equipment',()=>{
  const catalog=adventure4HorizontalGearCatalog();
  assert.ok(catalog.length>0);
  assert.ok(catalog.every(row=>BOUNTY_UNIQUES.some(item=>item.id===row.id)));
  assert.ok(catalog.every(row=>row.conditional===true&&row.effectKinds.length>0));
});

test('W30 represents Rift, Nemesis, Machine and Secret activity-derived conditional gear without a new rarity or power axis',()=>{
  for(const source of ['rift','nemesis','machine','secret_realm'])assert.ok(adventure4HorizontalGearByActivity(source).length>0,source);
  const src=fs.readFileSync('js/data/adventureWorld4HorizontalGear.js','utf8');
  assert.doesNotMatch(src,/itemPower\s*[+*=]/i);
  assert.doesNotMatch(src,/dropRate|rewardMultiplier|gainGold|addItem\s*\(/);
});

test('W31 Content Pack II gives every existing World 3/4 Region authored event coverage',()=>{
  assert.equal(ADVENTURE4_CONTENT_PACK_II_SCENES.length,WORLD3_REGIONS.length);
  for(const region of WORLD3_REGIONS){
    const pack=adventure4ContentPackIIForRegion(region.id);
    assert.ok(pack.events.length>=1,region.id);
    assert.ok(pack.scenes.length>=1,region.id);
  }
});

test('W31 all authored scenes validate and avoid duplicate scene/event ids',()=>{
  assert.ok(ADVENTURE4_CONTENT_PACK_II_SCENES.every(scene=>validateAdventure4Scene(scene).ok));
  assert.equal(new Set(ADVENTURE4_CONTENT_PACK_II_SCENES.map(scene=>scene.id)).size,ADVENTURE4_CONTENT_PACK_II_SCENES.length);
  assert.equal(new Set(ADVENTURE4_CONTENT_PACK_II_EVENTS.map(event=>event.id)).size,ADVENTURE4_CONTENT_PACK_II_EVENTS.length);
});

test('W31 content has multiple interaction shapes rather than one repeated choice template',()=>{
  const tagSet=new Set(ADVENTURE4_CONTENT_PACK_II_EVENTS.flatMap(event=>event.tags));
  for(const tag of ['ambient','investigation','npc','mystery','secret'])assert.ok(tagSet.has(tag),tag);
  const signatures=new Set(ADVENTURE4_CONTENT_PACK_II_SCENES.map(scene=>scene.steps.map(step=>step.choices.length).join('-')));
  assert.ok(signatures.size>=3);
});

test('W32 world records derive Discovery, Region Boss, Nemesis, Mystery and Secret without owning save state',()=>{
  const records=adventure4ExplorationRecords({
    discoveries:{'old-road':true,'ignored':false},
    regionBosses:[{id:'boss-a',name:'Boss A',regionId:'frontier',cleared:true},{id:'boss-b',cleared:false}],
    nemesis:{rival:{name:'宿敵',rank:3}},
    eventsSeen:{'frontier-night-cart':1,'last-mortal-closed-well':2},
    eventCatalog:ADVENTURE4_CONTENT_PACK_II_EVENTS,
  });
  const summary=adventure4ExplorationRecordSummary(records);
  assert.equal(summary.discoveries,1);
  assert.equal(summary.regionBosses,1);
  assert.equal(summary.nemesis,1);
  assert.equal(summary.mysteries,1);
  assert.equal(summary.secrets,1);
  assert.equal(summary.total,5);
});

test('W32 integrates exploration records into the existing Settlement Chronicle instead of creating another record screen/root',()=>{
  assert.ok(SETTLEMENT_CHRONICLE_EXHIBITS.some(exhibit=>exhibit.id==='worldRecords'));
  const runtime=fs.readFileSync('js/patches/adventureWorld4WorldRecords.js','utf8');
  const settlement=fs.readFileSync('js/patches/settlementChronicle.js','utf8');
  assert.doesNotMatch(runtime,/state\.data\.\w+\s*=(?!=)/);
  assert.doesNotMatch(runtime,/\.save\(\)/);
  assert.match(settlement,/adventure4WorldRecords/);
  assert.match(settlement,/worldRecords/);
});
