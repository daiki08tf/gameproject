import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPLORATION_SITES, explorationProgressFor } from '../js/data/exploration1.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { findStage } from '../js/data/stages.js';

test('Exploration 1.0 starts with a blood gate and the seven-key final mystery',()=>{
  assert.equal(EXPLORATION_SITES.length,2);
  assert.ok(EXPLORATION_SITES.some(x=>x.id==='blood_gate'));
  assert.ok(EXPLORATION_SITES.some(x=>x.id==='seven_seal_gate'&&x.fragmentsRequired===7));
});

test('blood gate progresses hidden -> discovered -> clued -> unlocked',()=>{
  const site=EXPLORATION_SITES.find(x=>x.id==='blood_gate');
  assert.equal(explorationProgressFor(site,326,{}).state,'hidden');
  assert.equal(explorationProgressFor(site,327,{}).state,'discovered');
  assert.equal(explorationProgressFor(site,420,{}).state,'clued');
  assert.equal(explorationProgressFor(site,800,{}).state,'unlocked');
  assert.equal(explorationProgressFor(site,800,{}).fragments,3);
});

test('manual inspection reveals clues without handing out missing fragments',()=>{
  const site=EXPLORATION_SITES.find(x=>x.id==='blood_gate');
  const p=explorationProgressFor(site,350,{inspected:true});
  assert.equal(p.state,'clued');
  assert.equal(p.fragments,0);
  assert.equal(p.unlocked,false);
});

test('Blood Castle is a playable non-Abyss secret stage with targeted Blood King loot',()=>{
  const stage=buildSecretRealmStage('secret-blood-castle');
  assert.equal(stage.secretRealm,true);
  assert.equal(stage.isAbyss,false);
  assert.equal(stage.name,'異界・血王城');
  assert.ok(stage.dropTable.some(x=>x.itemId==='set_blood_head'));
  assert.ok(stage.dropTable.some(x=>x.itemId==='set_blood_body'));
  assert.ok(stage.dropTable.some(x=>x.itemId==='set_blood_accessory'));
});

test('findStage resolves Secret Realm ids through the canonical battle route',()=>{
  const found=findStage('secret-blood-castle');
  assert.ok(found);
  assert.equal(found.chapter,null);
  assert.equal(found.stage.secretRealmId,'blood_gate');
});
