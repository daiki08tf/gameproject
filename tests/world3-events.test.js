import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WORLD_EVENTS, worldEventOutcome } from '../js/data/world2.js';

test('World events expose persistent discovery outcomes',()=>{
  assert.ok(WORLD_EVENTS.length>=6);
  for(const event of WORLD_EVENTS){
    assert.ok(event.text);
    assert.ok(Array.isArray(event.choices)&&event.choices.length>=2);
    assert.ok(Array.isArray(event.outcomes)&&event.outcomes.length===event.choices.length);
  }
  assert.equal(worldEventOutcome(WORLD_EVENTS.find(e=>e.id==='tracks'),0)?.flag,'hiddenTrail');
  assert.equal(worldEventOutcome(WORLD_EVENTS.find(e=>e.id==='rift'),0)?.flag,'riftAttunement');
});

test('World core persists discoveries and result UI surfaces choices',()=>{
  const core=fs.readFileSync(new URL('../js/patches/world2Core.js',import.meta.url),'utf8');
  const result=fs.readFileSync(new URL('../js/screens/result.js',import.meta.url),'utf8');
  const stage=fs.readFileSync(new URL('../js/screens/stageSelect.js',import.meta.url),'utf8');
  assert.match(core,/world2Discoveries/);
  assert.match(core,/discoveries\[outcome\.flag\]/);
  assert.match(result,/探索イベント/);
  assert.match(result,/world2ResolveEvent/);
  assert.match(stage,/旅で得た縁と手掛かり/);
});
