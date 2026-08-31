import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { buildTavernRumors } from '../js/data/settlementTavern.js';
import { CLR10_ELITE_RETURN_MEMORY_ID,CLR10_BOSS_RETURN_MEMORY_ID } from '../js/data/coreLoopClr10.js';
// settlementTavern.js reads state.settlementLevel(), which settlementCore.js
// registers. The real app always loads settlementCore.js before
// settlementTavern.js (see homeNavigation.js's bootstrap chain) — this test
// calls the live state.settlementTavernContext()/settlementTavernRumors()
// methods directly, so it needs the same dependency imported here.
import '../js/patches/settlementCore.js';
import '../js/patches/settlementTavern.js';

function memory(flags={}){
  return {visits:1,status:'resolved',outcome:'returned',firstAdventure:1,lastAdventure:1,flags:{safeReturn:true,...flags}};
}
function resetWorld(eventMemory={}){
  state.data.world2={eventMemory};
  state.data.monsterCodex={};
  state.data.stageProgress={};
  state.data.abyssBestDepth=0;
  state.data.settlementBuildings={hall:5,inn:0,market:0,watch:0,ranch:0};
  // settlementCore.js's settlementLevel() lazily migrates settlementBuildings
  // the first time it runs on a save that predates its __settlement3
  // bookkeeping (achievedEras/residents/etc.) — a real save that already
  // reached hall 5 would have gone through that migration long ago. Prime it
  // here so the "read-only" assertions below only catch mutations CLR-11's
  // own runtime causes, not this unrelated pre-existing one-time migration.
  state.settlementLevel('hall');
}

test('CLR-11 has no combat-return rumor before CLR-10 durable memory exists',()=>{
  const rumors=buildTavernRumors({hall:5});
  assert.equal(rumors.some(x=>x.id.startsWith('clr11_')),false);
});

test('CLR-11 elite safe return projects into an existing tavern rumor without granting progression',()=>{
  const rumors=buildTavernRumors({hall:5,frontierEliteSafeReturn:true});
  const reaction=rumors.find(x=>x.id==='clr11_frontier_elite_return');
  assert.ok(reaction);
  assert.equal(reaction.kind,'victory');
  assert.equal(reaction.source,'冒険者の噂');
  assert.equal('reward' in reaction,false);
  assert.equal('unlock' in reaction,false);
});

test('CLR-11 boss safe return creates the stronger return rumor and deterministic ordering',()=>{
  const rumors=buildTavernRumors({hall:5,frontierEliteSafeReturn:true,frontierBossSafeReturn:true});
  assert.deepEqual(rumors.filter(x=>x.id.startsWith('clr11_')).map(x=>x.id),[
    'clr11_frontier_boss_return',
    'clr11_frontier_elite_return',
  ]);
  assert.equal(rumors[0].source,'帰還者の証言');
});

test('CLR-11 runtime reads only resolved safe-return Event Memory and is read-only',()=>{
  resetWorld({
    [CLR10_ELITE_RETURN_MEMORY_ID]:memory({eliteDefeated:true}),
    [CLR10_BOSS_RETURN_MEMORY_ID]:{...memory({bossDefeated:true}),status:'recorded'},
  });
  const before=JSON.stringify(state.data);
  const context=state.settlementTavernContext();
  const rumors=state.settlementTavernRumors();
  assert.equal(context.frontierEliteSafeReturn,true);
  assert.equal(context.frontierBossSafeReturn,false);
  assert.equal(rumors.some(x=>x.id==='clr11_frontier_elite_return'),true);
  assert.equal(rumors.some(x=>x.id==='clr11_frontier_boss_return'),false);
  assert.equal(JSON.stringify(state.data),before);
});

test('CLR-11 creates no parallel save root, currency, reward authority, or mandatory discovery',()=>{
  resetWorld({[CLR10_BOSS_RETURN_MEMORY_ID]:memory({bossDefeated:true})});
  const beforeWorld=JSON.stringify(state.data.world2);
  const rumors=state.settlementTavernRumors();
  assert.equal(rumors.some(x=>x.id==='clr11_frontier_boss_return'),true);
  assert.equal('clr11' in state.data,false);
  assert.equal('currency' in state.data,false);
  assert.equal(JSON.stringify(state.data.world2),beforeWorld);
});
