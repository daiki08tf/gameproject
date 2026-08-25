import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WORLD3_REALM_NODES, visibleWorld3RealmNodes, world3RealmNodeState } from '../js/data/world3Realms.js';

test('World 3.0 exposes four realm nodes',()=>{
  assert.deepEqual(WORLD3_REALM_NODES.map(x=>x.id),['mortal','heaven','underworld','modern']);
});

test('heaven and underworld progress from hidden to hint to selectable open nodes',()=>{
  const heaven=WORLD3_REALM_NODES.find(x=>x.id==='heaven');
  const underworld=WORLD3_REALM_NODES.find(x=>x.id==='underworld');
  assert.equal(world3RealmNodeState(heaven,{heaven:'hidden'},{}).state,'hidden');
  assert.equal(world3RealmNodeState(heaven,{heaven:'hint'},{}).selectable,false);
  assert.equal(world3RealmNodeState(heaven,{heaven:'open'},{heavenOpened:true}).selectable,true);
  assert.equal(world3RealmNodeState(underworld,{underworld:'hint'},{}).selectable,false);
  assert.equal(world3RealmNodeState(underworld,{underworld:'open'},{underworldOpened:true}).selectable,true);
});

test('modern realm escalates mystery after anomaly clear without becoming a normal open realm',()=>{
  const modern=WORLD3_REALM_NODES.find(x=>x.id==='modern');
  const unknown=world3RealmNodeState(modern,{modern:'unknown'},{});
  const contact=world3RealmNodeState(modern,{modern:'hint'},{modernContact:true});
  const signal=world3RealmNodeState(modern,{modern:'hint'},{modernContact:true,modernSignal:true});
  assert.equal(unknown.badge,'???');
  assert.equal(contact.badge,'CONTACT');
  assert.equal(signal.badge,'SIGNAL');
  assert.match(signal.detail,/人工物/);
  assert.equal(signal.selectable,false);
});

test('realm node visibility only surfaces discovered worlds',()=>{
  const rows=visibleWorld3RealmNodes({mortal:'open',heaven:'hint',underworld:'hidden',modern:'hidden'},{});
  assert.deepEqual(rows.map(x=>x.id),['mortal','heaven']);
});

test('World screen renders realm nodes and routes opened realms into discovered branches',()=>{
  const src=fs.readFileSync(new URL('../js/screens/chapterSelect.js',import.meta.url),'utf8');
  assert.match(src,/世界層/);
  assert.match(src,/visibleWorld3RealmNodes/);
  assert.match(src,/node\.selectable&&node\.route/);
  assert.match(src,/world3-branches/);
});
