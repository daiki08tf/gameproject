import test from 'node:test';
import assert from 'node:assert/strict';
import { FUSION_COMBAT_IDENTITIES } from '../js/data/fusionCombatIdentity.js';

test('Fusion battle commands are executable-shaped for every job',()=>{
 for(const x of FUSION_COMBAT_IDENTITIES){
  assert.equal(x.gauge.max,100);
  assert.equal(x.command.cost,100);
  assert.ok(x.command.power>=1);
  assert.equal(x.command.effects.length,2);
 }
});
test('all generated effect tags belong to battle integration vocabulary',()=>{
 const supported=new Set(['break','combo','element','heal','crit','supply','mark','status','buff','evade','reaction','analysis','regen','fortify','fate']);
 for(const x of FUSION_COMBAT_IDENTITIES) for(const e of x.command.effects) assert.ok(supported.has(e),`${x.jobId}:${e}`);
});
