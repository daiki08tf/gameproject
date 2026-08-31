import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { CLR1_COMBAT_CHAIN_TAG,adventure4Clr1BattleResultPatch,adventure4Clr1BattleTypeClearFlag } from '../js/data/coreLoopClr1.js';
import { CLR10_ELITE_RETURN_MEMORY_ID,CLR10_BOSS_RETURN_MEMORY_ID,adventure4Clr10ReturnMilestones } from '../js/data/coreLoopClr10.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import '../js/patches/adventureWorld4EventMemoryRuntime.js';
import '../js/patches/coreLoopClr10Runtime.js';

function reset(regionId='frontier'){
  state.data.adventure4=defaultAdventure4Session();
  state.data.world2={discoveries:{},flags:{},eventsSeen:{},eventChains:{},eventMemory:{},adventureEventMeta:{adventureIndex:1,lastSeenAdventure:{},recentEventIds:[]}};
  state.startAdventure4({regionId});
}
function clrNode(id,type){return{id,type,tags:[CLR1_COMBAT_CHAIN_TAG]};}
function applyVictory(node,result={cleared:true}){
  const patch=adventure4Clr1BattleResultPatch(node,result,state.adventure4Session());
  if(patch)state.checkpointAdventure4(patch);
  return patch;
}

test('CLR-10 CLR-1 records elite/boss type milestones only on victory',()=>{
  reset();
  assert.equal(applyVictory(clrNode('elite-1','elite'),{cleared:false}),null);
  assert.equal(state.adventure4Session().temporaryFlags[adventure4Clr1BattleTypeClearFlag('elite')],undefined);
  applyVictory(clrNode('elite-1','elite'));
  applyVictory(clrNode('boss-1','boss'));
  const milestones=adventure4Clr10ReturnMilestones(state.adventure4Session());
  assert.equal(milestones.eliteCleared,true);
  assert.equal(milestones.bossCleared,true);
});

test('CLR-10 suspend/defeat do not promote combat milestones into persistent Event Memory',()=>{
  reset();
  applyVictory(clrNode('elite-1','elite'));
  state.suspendAdventure4();
  assert.equal(state.adventure4EventMemory(CLR10_ELITE_RETURN_MEMORY_ID),null);
  assert.equal(state.adventure4EventMemory(CLR10_BOSS_RETURN_MEMORY_ID),null);
});

test('CLR-10 explicit safe return promotes existing CLR-1 milestones into world2.eventMemory',()=>{
  reset();
  applyVictory(clrNode('elite-1','elite'));
  applyVictory(clrNode('boss-1','boss'));
  const returned=state.returnFromAdventure4();
  assert.equal(returned.ok,true);
  assert.equal(returned.clr10ReturnReactions.length,2);
  const elite=state.adventure4EventMemory(CLR10_ELITE_RETURN_MEMORY_ID);
  const boss=state.adventure4EventMemory(CLR10_BOSS_RETURN_MEMORY_ID);
  assert.equal(elite.status,'resolved');
  assert.equal(elite.flags.safeReturn,true);
  assert.equal(boss.outcome,'boss-defeated-and-returned');
  assert.equal(boss.flags.bossDefeated,true);
});

test('CLR-10 durable reactions are idempotent across later successful returns',()=>{
  reset();
  applyVictory(clrNode('elite-1','elite'));
  state.returnFromAdventure4();
  const first=state.adventure4EventMemory(CLR10_ELITE_RETURN_MEMORY_ID);
  assert.equal(first.visits,1);

  state.startAdventure4({regionId:'frontier'});
  applyVictory(clrNode('elite-2','elite'));
  const returned=state.returnFromAdventure4();
  const second=state.adventure4EventMemory(CLR10_ELITE_RETURN_MEMORY_ID);
  assert.equal(returned.clr10ReturnReactions.length,0);
  assert.equal(second.visits,1);
});

test('CLR-10 first vertical slice is frontier-only and creates no CLR save root/currency/reward authority',()=>{
  reset('elemental');
  applyVictory(clrNode('elite-1','elite'));
  applyVictory(clrNode('boss-1','boss'));
  const returned=state.returnFromAdventure4();
  assert.equal(returned.clr10ReturnReactions.length,0);
  assert.equal(state.adventure4EventMemory(CLR10_ELITE_RETURN_MEMORY_ID),null);
  assert.equal('clr10' in state.data,false);
  assert.equal('currency' in state.data,false);
});
