import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bossEncounterProfile } from '../js/data/bossEncounters.js';
import { PHASE12_LORE_FRAGMENTS,PHASE12_RUMORS,phase12DiscoveryForStage,phase12RumorFromFlag } from '../js/data/phase12WorldActivity.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';

test('Phase 12.7 gives all five horizontal bosses bespoke multi-phase counterplay',()=>{
  const ids=['phase12_tomb_king','phase12_phantom_lord','phase12_bone_tyrant','phase12_archive_master','phase12_moon_deity'];
  for(const id of ids){
    const p=bossEncounterProfile(id);
    assert.ok(p);
    assert.ok(p.phases.length>=3);
    assert.ok(p.dangerTags?.length>=3);
    assert.ok(p.counterHint?.length>10);
    assert.ok(p.phases.some(x=>Number.isFinite(x.breakGaugePct)));
  }
  assert.equal(bossEncounterProfile('phase12_moon_deity').phases.length,4);
});

test('Phase 12.8 provides three optional lore fragments for each horizontal site',()=>{
  assert.equal(Object.keys(PHASE12_LORE_FRAGMENTS).length,5);
  for(const fragments of Object.values(PHASE12_LORE_FRAGMENTS)){
    assert.equal(fragments.length,3);
    assert.ok(fragments.every(x=>x.length>10&&x.length<80));
    assert.doesNotMatch(fragments.join(' '),/現代世界が原因|最終回答/);
  }
});

test('Phase 12.9 rumors point at all five optional dungeons using existing event flags',()=>{
  assert.equal(PHASE12_RUMORS.length,5);
  assert.equal(new Set(PHASE12_RUMORS.map(x=>x.targetSiteId)).size,5);
  assert.equal(phase12RumorFromFlag('oldPatrolMark').targetSiteId,'old_king_tomb');
  assert.equal(phase12RumorFromFlag('beastTrail').targetSiteId,'phantom_beast_forest');
  assert.equal(phase12RumorFromFlag('meteorBearing').targetSiteId,'dragonbone_canyon');
  assert.equal(phase12RumorFromFlag('borderRumor').targetSiteId,'inverted_library');
  assert.equal(phase12RumorFromFlag('modernSignal').targetSiteId,'black_moon_temple');
});

test('Phase 12.10 reuses World 2 discovery ledger for event rumors and dungeon traces',()=>{
  const core=fs.readFileSync(new URL('../js/patches/world2Core.js',import.meta.url),'utf8');
  assert.match(core,/phase12RumorFromFlag/);
  assert.match(core,/w\.discoveries\[id\]/);
  assert.match(core,/phase12DiscoveryForStage/);
  assert.match(core,/phase12Trace/);
  assert.doesNotMatch(core,/phase12Currency|new Map\(.*rumor/i);
});

test('horizontal clear evidence is generated from the actual stage metadata',()=>{
  const original=Math.random;Math.random=()=>.99;
  let stage;
  try{stage=buildSecretRealmStage('secret-black-moon-temple');}finally{Math.random=original;}
  const discovery=phase12DiscoveryForStage(stage);
  assert.equal(discovery.id,'trace:black_moon_temple');
  assert.equal(discovery.fragments.length,3);
  assert.match(discovery.name,/黒月神殿/);
  assert.ok(discovery.hint.length>10);
});
