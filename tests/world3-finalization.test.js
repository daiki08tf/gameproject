import test from 'node:test';
import assert from 'node:assert/strict';
import { world2KeyStageDescriptor } from '../js/data/world2Stages.js';
import { world3RealmNodeState, WORLD3_REALM_NODES } from '../js/data/world3Realms.js';

test('Heaven and Underworld have distinct destination identities',()=>{
  const heaven=world2KeyStageDescriptor('celestial');
  const underworld=world2KeyStageDescriptor('infernal');
  assert.equal(heaven.world3Identity,'聖域探索');
  assert.match(heaven.world3Goal,/Relic/);
  assert.equal(underworld.world3Identity,'高危険探索');
  assert.match(underworld.world3Goal,/Unique/);
});

test('modern mystery escalates to TRACE without revealing a destination name',()=>{
  const modern=WORLD3_REALM_NODES.find(x=>x.id==='modern');
  const trace=world3RealmNodeState(modern,{modern:'hint'},{modernContact:true,modernSignal:true,modernTrace:true});
  assert.equal(trace.badge,'TRACE');
  assert.equal(trace.selectable,false);
  assert.equal(trace.name,'？？？');
  assert.match(trace.detail,/人工|自然物では説明できない/);
});
