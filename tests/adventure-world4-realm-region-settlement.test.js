import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import { ADVENTURE4_REALM_SIGNALS,adventure4RealmSignalStage,adventure4DynamicRegionState,buildAdventure4RealmSignalScene } from '../js/data/adventureWorld4RealmDiscovery.js';
import { resolveAdventure4SceneChoice } from '../js/data/adventureWorld4Scenes.js';
import '../js/patches/adventureWorld4RealmRegionRuntime.js';
import '../js/patches/adventureWorld4SceneRuntime.js';

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.stageProgress={};
  state.data.world2={keyFragments:0,keys:{},discoveries:{},flags:{},eventsSeen:{},eventChains:{},keyDungeonClears:{},adventureEventMeta:{adventureIndex:0,lastSeenAdventure:{},recentEventIds:[]},lastEvent:null};
  state.data.riftKeys=[];state.data.riftKeySeq=1;
  state.data.settlementBuildings={hall:0,inn:0,market:0,watch:0,ranch:0};
  state.data.worldTierId='normal';state.data.bountyNemesis={};state.data.bounty2Wins={};state.data.bountyMarks=0;
}

test('W23 Realm signals are derived from existing realm/machine/rift authorities',()=>{
  const heaven=ADVENTURE4_REALM_SIGNALS.find(x=>x.id==='heaven');
  const machine=ADVENTURE4_REALM_SIGNALS.find(x=>x.id==='machine');
  assert.equal(adventure4RealmSignalStage(heaven,{realmVisibility:[{id:'heaven',state:'hint'}],recorded:{}}),'rumor');
  assert.equal(adventure4RealmSignalStage(heaven,{realmVisibility:[{id:'heaven',state:'open'}],recorded:{}}),'open');
  assert.equal(adventure4RealmSignalStage(heaven,{realmVisibility:{heaven:'hint'},recorded:{}}),'rumor');
  assert.equal(adventure4RealmSignalStage(heaven,{realmVisibility:{heaven:'open'},recorded:{}}),'open');
  assert.equal(adventure4RealmSignalStage(machine,{machineUnlocked:false,flags:{modernTrace:true},recorded:{}}),'trace');
  assert.equal(adventure4RealmSignalStage(machine,{machineUnlocked:true,flags:{},recorded:{}}),'open');
});

test('W23 unknown Realm signals stay hidden without leaking a missing total',()=>{
  reset();
  assert.deepEqual(state.adventure4RealmSignals(),[]);
  assert.equal(state.data.adventure4RealmProgress,undefined);
});

test('W23 Adventure discovery writes existing world2.discoveries and never grants a key or Realm unlock',()=>{
  reset();state.data.world2.flags.riftAttunement=true;state.startAdventure4({regionId:'fracture'});
  const before={fragments:state.data.world2.keyFragments,keys:JSON.stringify(state.data.world2.keys),rift:state.riftKeys().length,flags:{...state.data.world2.flags}};
  const signal=state.adventure4RealmSignalForRegion('fracture');assert.equal(signal.id,'rift');
  const scene=buildAdventure4RealmSignalScene(signal),resolution=resolveAdventure4SceneChoice(scene,'observe','inspect',{});
  const applied=state.applyAdventure4SceneResolution(resolution);assert.equal(applied.realm.length,1);
  assert.ok(state.data.world2.discoveries['realm-signal-rift']);
  assert.ok(state.adventure4Session().discoveredThisRun.includes('realm-signal-rift'));
  assert.equal(state.data.world2.keyFragments,before.fragments);assert.equal(JSON.stringify(state.data.world2.keys),before.keys);assert.equal(state.riftKeys().length,before.rift);assert.deepEqual(state.data.world2.flags,before.flags);
});

test.skip('W24 Dynamic Region is deterministic overlay state and preserves authored identity',()=>{});
test.skip('W25 Adventure findings flow into existing Settlement Research without a new report store',()=>{});
test.skip('W25 existing Expedition lead feeds future Adventure context without currency or unlock duplication',()=>{});