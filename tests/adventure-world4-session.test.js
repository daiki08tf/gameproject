import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session,normalizeAdventure4Session } from '../js/patches/adventureWorld4Session.js';

function resetAdventure(){state.data.adventure4=defaultAdventure4Session();}

test('W2 legacy save backfills an empty Adventure session safely',()=>{
  delete state.data.adventure4;
  const session=state.adventure4Session();
  assert.deepEqual(session,defaultAdventure4Session());
  assert.deepEqual(state.data.adventure4,defaultAdventure4Session());
});

test('W2 supports depart, checkpoint, suspend, resume and return',()=>{
  resetAdventure();
  const started=state.startAdventure4({regionId:'frontier',routeId:'story-1',currentNodeId:'node-a',seed:42,returnTarget:'settlement'});
  assert.equal(started.ok,true);
  assert.equal(state.adventure4HasSession(),true);
  assert.equal(state.adventure4CanResume(),false);

  const checkpoint=state.checkpointAdventure4({currentNodeId:'node-b',visitedNodeIds:['node-a','node-a','node-b'],cluesThisRun:['clue-1']});
  assert.equal(checkpoint.ok,true);
  assert.equal(checkpoint.session.currentNodeId,'node-b');
  assert.deepEqual(checkpoint.session.visitedNodeIds,['node-a','node-b']);

  assert.equal(state.suspendAdventure4().ok,true);
  assert.equal(state.adventure4CanResume(),true);
  assert.equal(state.resumeAdventure4().ok,true);
  assert.equal(state.adventure4CanResume(),false);

  const returned=state.returnFromAdventure4();
  assert.equal(returned.ok,true);
  assert.equal(returned.returnTarget,'settlement');
  assert.equal(returned.session.currentNodeId,'node-b');
  assert.deepEqual(state.adventure4Session(),defaultAdventure4Session());
});

test('W2 keeps Adventure-only state separate from persistent progression and discoveries',()=>{
  resetAdventure();
  state.data.gold=777;
  state.data.stageProgress={'1-1':{cleared:true}};
  state.data.world2={discoveries:{ancient_gate:{name:'古代門'}},flags:{gateOpen:true},eventChains:{}};

  state.startAdventure4({regionId:'frontier'});
  const result=state.checkpointAdventure4({
    discoveredThisRun:['ancient_gate'],
    temporaryFlags:{sawMist:true},
    gold:1,
    stageProgress:{},
    world2:{discoveries:{}},
  });
  assert.equal(result.ok,true);
  assert.equal('gold' in result.session,false);
  assert.equal('stageProgress' in result.session,false);
  assert.equal('world2' in result.session,false);
  assert.equal(state.data.gold,777);
  assert.deepEqual(state.data.stageProgress,{'1-1':{cleared:true}});
  assert.equal(state.data.world2.discoveries.ancient_gate.name,'古代門');

  state.returnFromAdventure4();
  assert.equal(state.data.world2.flags.gateOpen,true);
  assert.equal(state.data.world2.discoveries.ancient_gate.name,'古代門');
});

test('W2 normalization repairs malformed or incomplete legacy session data',()=>{
  const normalized=normalizeAdventure4Session({
    active:true,
    suspended:1,
    regionId:'veil',
    visitedNodeIds:['a','a',null,3],
    discoveredThisRun:'bad',
    cluesThisRun:['x'],
    temporaryFlags:null,
    seed:'42',
  });
  assert.equal(normalized.active,true);
  assert.equal(normalized.suspended,true);
  assert.deepEqual(normalized.visitedNodeIds,['a']);
  assert.deepEqual(normalized.discoveredThisRun,[]);
  assert.deepEqual(normalized.cluesThisRun,['x']);
  assert.deepEqual(normalized.temporaryFlags,{});
  assert.equal(normalized.seed,null);

  const invalidActive=normalizeAdventure4Session({active:true,regionId:null,currentNodeId:'orphan'});
  assert.deepEqual(invalidActive,defaultAdventure4Session());
});
