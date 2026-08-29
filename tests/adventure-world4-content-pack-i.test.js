import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ADVENTURE4_CONTENT_PACK_I_EVENTS,ADVENTURE4_CONTENT_PACK_I_SCENES,adventure4ContentPackIForRegion } from '../js/data/adventureWorld4ContentPackI.js';
import { validateAdventure4Scene,resolveAdventure4SceneChoice } from '../js/data/adventureWorld4Scenes.js';
import { adventure4EventPool } from '../js/data/adventureWorld4Events.js';

test('W9 ships substantial authored content across the first three Regions',()=>{
  assert.equal(ADVENTURE4_CONTENT_PACK_I_SCENES.length,9);
  assert.equal(ADVENTURE4_CONTENT_PACK_I_EVENTS.length,9);
  for(const id of ['frontier','elemental','fracture']){
    const pack=adventure4ContentPackIForRegion(id);
    assert.equal(pack.events.length,3);
    assert.equal(pack.scenes.length,3);
  }
});

test('every W9 event points to a valid Scene graph',()=>{
  const ids=new Set(ADVENTURE4_CONTENT_PACK_I_SCENES.map(scene=>scene.id));
  for(const event of ADVENTURE4_CONTENT_PACK_I_EVENTS)assert.ok(ids.has(event.sceneId),event.id);
  for(const scene of ADVENTURE4_CONTENT_PACK_I_SCENES)assert.deepEqual(validateAdventure4Scene(scene),{ok:true,errors:[]});
});

test('W9 deliberately includes quiet Scenes where nothing rewards the player',()=>{
  const quiet=ADVENTURE4_CONTENT_PACK_I_SCENES.filter(scene=>scene.tags.includes('quiet'));
  assert.ok(quiet.length>=3);
  for(const scene of quiet)for(const step of scene.steps)for(const choice of step.choices)assert.equal(choice.consequences.length,0);
});

test('W9 investigation choices do not encode one universal moral answer',()=>{
  const sign=ADVENTURE4_CONTENT_PACK_I_SCENES.find(scene=>scene.id==='frontier-erased-sign');
  const observe=sign.steps.find(step=>step.id==='observe');
  assert.deepEqual(observe.choices.map(choice=>choice.label),['削り跡を調べる','触れずに離れる']);
  const leave=resolveAdventure4SceneChoice(sign,'observe','leave',{});
  assert.equal(leave.ok,true);
  assert.equal(leave.nextStepId,'leave');
});

test('frontier erased sign completes the W8 two-Trace clue vertical slice',()=>{
  const sign=ADVENTURE4_CONTENT_PACK_I_SCENES.find(scene=>scene.id==='frontier-erased-sign');
  const resolution=resolveAdventure4SceneChoice(sign,'recorded','finish',{});
  assert.equal(resolution.ok,true);
  assert.ok(resolution.consequences.some(effect=>effect.type==='trace'&&effect.key==='frontier-pilot-broken-marker'));
});

test('W6 history rules prevent the W9 oneShot investigation from repeating',()=>{
  const pack=adventure4ContentPackIForRegion('frontier');
  const pool=adventure4EventPool(pack.events,{eventsSeen:{'frontier-erased-sign':1},eventChains:{},adventureIndex:4,lastSeenAdventure:{},recentEventIds:[]});
  assert.equal(pool.some(event=>event.id==='frontier-erased-sign'),false);
  assert.ok(pool.some(event=>event.tags.includes('ambient')));
});

test('W9 runtime is a single optional scene layer and does not replace Story/Battle authority',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/adventureWorld4ContentPackI.js',import.meta.url),'utf8');
  const ui=fs.readFileSync(new URL('../js/patches/adventureWorld4Ui.js',import.meta.url),'utf8');
  assert.match(runtime,/rollAdventure4Event/);
  assert.match(runtime,/recordAdventure4Event/);
  assert.doesNotMatch(runtime,/BattleEngine|dropRate|itemPower|reward/);
  assert.match(ui,/current\.id==='entry'&&renderAmbientScene/);
  assert.match(ui,/launchAdventureBattle/);
});
