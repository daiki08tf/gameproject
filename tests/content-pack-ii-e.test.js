import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP2_CODEX_ECOLOGY,CP2_CHAIN_LORE,CP2_ROUTE_OUTCOMES,cp2SuggestedDestination } from '../js/data/contentPackIIE.js';

test('CP2 E gives all hidden ecology and bosses authored Codex identity',()=>{
  assert.equal(Object.keys(CP2_CODEX_ECOLOGY).length,10);
  const ids=Object.keys(CP2_CODEX_ECOLOGY);
  assert.equal(ids.filter(x=>x.startsWith('cp2_boss_')).length,5);
  assert.equal(ids.filter(x=>!x.startsWith('cp2_boss_')).length,5);
  for(const x of Object.values(CP2_CODEX_ECOLOGY)){
    assert.ok(x.habitat.length>4);assert.ok(x.ecology.length>12);
    assert.doesNotMatch(x.ecology,/東京|日本|Tokyo|Japan/);
  }
});

test('CP2 E closes all five hidden routes and preserves restrained world mystery',()=>{
  assert.equal(Object.keys(CP2_ROUTE_OUTCOMES).length,5);
  assert.equal(Object.keys(CP2_CHAIN_LORE).length,3);
  for(const lore of Object.values(CP2_CHAIN_LORE)){
    assert.match(lore.id,/^cp2:lore:/);assert.ok(lore.text.length>30);
    assert.doesNotMatch(lore.text,/東京|日本|Tokyo|Japan/);
  }
});

test('CP2 E provides useful revisit guidance without exposing encounter percentages',()=>{
  const unresolved=cp2SuggestedDestination('silver-deer',{discoveries:{}});
  assert.equal(unresolved.stageId,'secret-phantom-beast-forest');
  assert.match(unresolved.reason,/追跡/);
  const resolved=cp2SuggestedDestination('silver-deer',{discoveries:{'cp2:encounter:silver-deer':{}}});
  assert.match(resolved.reason,/隠し経路/);
  assert.doesNotMatch(JSON.stringify({unresolved,resolved}),/%|0\.0\d/);
});

test('CP2 E reuses Codex and Rumor Notebook with compact NEXT and lore disclosure',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIIE.js',import.meta.url),'utf8');
  const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  assert.match(home,/contentPackIIE\.js/);
  assert.match(runtime,/state\.codexFieldGuide/);
  assert.match(runtime,/state\.rumorNotebook/);
  assert.match(runtime,/NEXT —/);
  assert.match(runtime,/ui-detail-disclosure/);
  assert.match(runtime,/world2\.discoveries/);
  assert.doesNotMatch(home,/goCP2E|goContentPack|LoreBtn/);
});

test('CP2 E keeps save lazy and battle safety untouched',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIIE.js',import.meta.url),'utf8');
  const mobile=fs.readFileSync(new URL('../tests/phase14-mobile-command-regression.test.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.data\.world2\?\?=/);
  assert.doesNotMatch(runtime,/localStorage|SAVE_KEY|encounterQueue|aliveEnemies/);
  assert.match(mobile,/command|attack/i);
});
