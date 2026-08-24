import test from 'node:test';
import assert from 'node:assert/strict';
import { availableKeyDungeons,realmVisibility,rollWorldEvent,worldProgressFromClears } from '../js/data/world2.js';

test('world progress counts cleared region bosses in order',()=>{const chapters=[{stages:[{id:'a1'},{id:'a2'}]},{stages:[{id:'b1'},{id:'b2'}]},{stages:[{id:'c1'},{id:'c2'}]}];const cleared=new Set(['a2','b2']);assert.equal(worldProgressFromClears(chapters,id=>cleared.has(id)),2);});
test('key dungeons unlock by progress and fragment cost',()=>{assert.equal(availableKeyDungeons(4,99).length,0);assert.ok(availableKeyDungeons(18,7).some(x=>x.id==='anomaly'));});
test('realm visibility reveals heaven and underworld before opening them',()=>{const v=realmVisibility(16,{});assert.equal(v.heaven,'hint');assert.equal(v.underworld,'hint');assert.equal(v.modern,'hidden');});
test('modern anomaly remains mysterious at late progress',()=>{assert.equal(realmVisibility(18,{}).modern,'unknown');assert.equal(realmVisibility(18,{modernContact:true}).modern,'hint');});
test('world event roll is deterministic for a fixed rng',()=>{assert.equal(rollWorldEvent(()=>0).id,'traveler');assert.ok(rollWorldEvent(()=>.99).id);});
