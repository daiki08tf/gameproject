import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAdventure4PilotRoute,adventure4PilotPreview } from '../js/data/adventureWorld4Pilot.js';
import { validateAdventure4Route } from '../js/data/adventureWorld4Routes.js';

const region={id:'frontier',name:'開拓辺境'};
const progress={routeEntry:{chapterNumber:1,chapterName:'第一章',stageId:'1-1',stageName:'草原'}};

test('W4 pilot wraps the canonical next Story stage as a battle node',()=>{
  const route=buildAdventure4PilotRoute(region,progress);
  assert.equal(validateAdventure4Route(route).ok,true);
  assert.equal(route.id,'frontier-story-pilot');
  const battle=route.nodes.find(node=>node.id==='story');
  assert.equal(battle.type,'battle');
  assert.equal(battle.stageId,'1-1');
  assert.equal('waves' in battle,false);
  assert.equal('rewards' in battle,false);
  assert.equal('recLevel' in battle,false);
});

test('W4 pilot provides a real branch: Story battle or return',()=>{
  const route=buildAdventure4PilotRoute(region,progress);
  const fork=route.nodes.find(node=>node.id==='fork');
  assert.deepEqual(fork.next,['story','return']);
  assert.equal(route.nodes.find(node=>node.id==='return').type,'camp');
});

test('W4 completed region does not invent another Story stage',()=>{
  const route=buildAdventure4PilotRoute(region,{routeEntry:null});
  assert.equal(route.nodes.some(node=>node.id==='story'),false);
  assert.deepEqual(route.nodes.find(node=>node.id==='fork').next,['return']);
});

test('W4 route preview reveals only current, immediate next, and an unknown horizon',()=>{
  const route=buildAdventure4PilotRoute(region,progress);
  const preview=adventure4PilotPreview(route,'entry');
  assert.deepEqual(preview.map(item=>item.state),['current','next','unknown']);
  assert.equal(preview.at(-1).name,'この先は未詳');
  assert.equal(preview.some(item=>item.name==='草原'),false);
});

test('W4 UI reuses the existing Home CTA and canonical TextBattleScreen',async()=>{
  const source=await readFile(new URL('../js/patches/adventureWorld4Ui.js',import.meta.url),'utf8');
  assert.match(source,/getElementById\('goStageBtn'\)/);
  assert.match(source,/stopImmediatePropagation\(\)/);
  assert.match(source,/new TextBattleScreen\(\)/);
  assert.match(source,/pendingEncounter/);
  assert.doesNotMatch(source,/world4Tier|explorationXp|adventureLevel|energy:/i);
});
