import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { adventure4AvailableNext,validateAdventure4Route } from '../js/data/adventureWorld4Routes.js';
import { buildAdventure4PilotRoute,adventure4RegionBossEndpoint,adventure4SecretBossEndpoint,adventure4ShortcutDiscoveryId } from '../js/data/adventureWorld4Pilot.js';

const region=buildWorld4RegionCatalog(CHAPTERS)[0];

function chapter(number){return CHAPTERS.find(ch=>Number(ch.num)===Number(number))||CHAPTERS[Number(number)-1];}
function canonicalBoss(ch){return ch?.stages?.find(stage=>stage.boss&&!stage.branch)||ch?.stages?.find(stage=>stage.boss)||ch?.stages?.at(-1)||null;}

test('W26 unresolved Story remains a canonical Stage-backed Region Story Route',()=>{
  const entry=region.routeEntries[0];
  const route=buildAdventure4PilotRoute(region,{status:'available',routeEntry:entry});
  assert.equal(route.id,`${region.id}-story-route`);
  assert.ok(route.tags.includes('story'));
  const story=route.nodes.find(node=>node.id==='story');
  assert.equal(story.stageId,entry.stageId);
  assert.equal(story.type,'battle');
  assert.equal(validateAdventure4Route(route).ok,true);
});

test('W26 Story completion unlocks Free Adventure without adding parallel progression',()=>{
  const route=buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null});
  assert.equal(route.id,`${region.id}-free-adventure`);
  assert.ok(route.tags.includes('free-adventure'));
  assert.equal(route.nodes.some(node=>node.tags.includes('story')),false);
  assert.equal(validateAdventure4Route(route).ok,true);
});

test('W27 Region Boss endpoint points at the existing final chapter completion Stage',()=>{
  const endpoint=adventure4RegionBossEndpoint(region);
  const lastChapter=chapter(region.chapterNumbers.at(-1));
  const boss=canonicalBoss(lastChapter);
  assert.ok(boss);
  assert.equal(endpoint.stageId,boss.id);
  const route=buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null});
  const node=route.nodes.find(item=>item.id==='region-boss');
  assert.equal(node.stageId,boss.id);
  assert.equal(node.type,'boss');
});

test('W27 Secret Boss framework requires a canonical Stage reference and compound knowledge flags',()=>{
  const boss=canonicalBoss(chapter(region.chapterNumbers.at(-1)));
  const secret=adventure4SecretBossEndpoint({stageId:boss.id});
  assert.equal(secret.stageId,boss.id);
  const route=buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null},{secretBoss:{stageId:boss.id}});
  assert.equal(adventure4AvailableNext(route,'boss-gate',{flags:{secretBossKnown:true,mysteryResolved:false}}).some(n=>n.id==='secret-boss'),false);
  assert.equal(adventure4AvailableNext(route,'boss-gate',{flags:{secretBossKnown:true,mysteryResolved:true}}).some(n=>n.id==='secret-boss'),true);
});

test('W28 Dungeon offers authored branch/camp/boss structure and a discovery-backed permanent shortcut',()=>{
  const route=buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null});
  for(const id of ['crossroads','deep-route','treasure','camp','boss-gate','return'])assert.ok(route.nodes.some(node=>node.id===id));
  const shortcutId=adventure4ShortcutDiscoveryId(region.id);
  const without=adventure4AvailableNext(route,'crossroads',{hasDiscovery:()=>false});
  const withShortcut=adventure4AvailableNext(route,'crossroads',{hasDiscovery:id=>id===shortcutId});
  assert.equal(without.some(node=>node.id==='shortcut'),false);
  assert.equal(withShortcut.some(node=>node.id==='shortcut'),true);
  const shortcut=route.nodes.find(node=>node.id==='shortcut');
  assert.equal(shortcut.hidden,true);
  assert.ok(shortcut.tags.includes('permanent'));
});
