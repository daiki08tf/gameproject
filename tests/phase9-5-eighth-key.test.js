import test from 'node:test';
import assert from 'node:assert/strict';
import { EIGHTH_KEY_STAGES, eighthKeyProgress } from '../js/data/phase9EighthKey.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { world3RealmNodeState, WORLD3_REALM_NODES } from '../js/data/world3Realms.js';

test('Eighth Key is a three-step postgame chain',()=>{
  assert.equal(EIGHTH_KEY_STAGES.length,3);
  assert.equal(EIGHTH_KEY_STAGES[0].requires,null);
  assert.equal(EIGHTH_KEY_STAGES[1].requires,EIGHTH_KEY_STAGES[0].id);
  assert.equal(EIGHTH_KEY_STAGES[2].requires,EIGHTH_KEY_STAGES[1].id);
  assert.equal(EIGHTH_KEY_STAGES[2].final,true);
});

test('Eighth Key stages are playable secret realms with escalating difficulty',()=>{
  const built=EIGHTH_KEY_STAGES.map(def=>buildSecretRealmStage(def.id));
  assert.ok(built.every(Boolean));
  assert.ok(built.every(s=>s.secretRealm&&s.phase9EighthKey));
  assert.ok(built[0].recLevel<built[1].recLevel&&built[1].recLevel<built[2].recLevel);
  assert.ok(built[0].healMult>built[1].healMult&&built[1].healMult>built[2].healMult);
  assert.equal(built[2].phase9EighthKeyFinal,true);
  assert.ok(built[2].dropMult>built[0].dropMult);
  assert.ok(built.every(s=>!('bgm' in s)));
});

test('Eighth Key progress only opens after all three clears',()=>{
  const cleared=new Set(EIGHTH_KEY_STAGES.slice(0,2).map(s=>s.id));
  assert.equal(eighthKeyProgress(id=>cleared.has(id)).open,false);
  cleared.add(EIGHTH_KEY_STAGES[2].id);
  const p=eighthKeyProgress(id=>cleared.has(id));
  assert.equal(p.open,true);assert.equal(p.cleared,3);assert.equal(p.next,null);
});

test('Machine World becomes a selectable world layer after Zero Gate',()=>{
  const modern=WORLD3_REALM_NODES.find(n=>n.id==='modern');
  const signal=world3RealmNodeState(modern,{modern:'hidden'},{phase9EighthKeyObserved:true});
  assert.equal(signal.state,'signal');
  const open=world3RealmNodeState(modern,{modern:'hidden'},{phase9MachineWorldOpen:true});
  assert.equal(open.name,'機界');assert.equal(open.state,'open');assert.equal(open.selectable,true);assert.equal(open.route,'world3-branches');
});
