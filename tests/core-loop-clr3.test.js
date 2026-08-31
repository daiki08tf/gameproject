import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute } from '../js/data/adventureWorld4Pilot.js';
import { adventure4Clr1BattleClearFlag } from '../js/data/coreLoopClr1.js';
import { CLR2_BRANCH_NODE_IDS } from '../js/data/coreLoopClr2.js';
import { adventure4Clr3RunSummary } from '../js/data/coreLoopClr3.js';

function route(){
  const region=buildWorld4RegionCatalog(CHAPTERS).find(item=>item.id==='frontier');
  return buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null});
}
function flagsFor(...ids){return Object.fromEntries(ids.map(id=>[adventure4Clr1BattleClearFlag(id),true]));}

test('CLR-3 derives pre-branch progress and a 5-to-6 battle remaining range from existing session flags',()=>{
  const summary=adventure4Clr3RunSummary({temporaryFlags:flagsFor('clr1-battle-1','clr1-battle-2','clr1-battle-3'),visitedNodeIds:[]},route());
  assert.equal(summary.cleared,3);
  assert.equal(summary.routeChoice,'undecided');
  assert.equal(summary.progressLabel,'3戦突破');
  assert.equal(summary.remainingMin,2);
  assert.equal(summary.remainingMax,3);
  assert.equal(summary.remainingLabel,'残り2〜3戦');
});

test('CLR-3 steady summary recognizes the 5-battle route after the midpoint choice',()=>{
  const summary=adventure4Clr3RunSummary({temporaryFlags:flagsFor('clr1-battle-1','clr1-battle-2','clr1-battle-3'),visitedNodeIds:[CLR2_BRANCH_NODE_IDS.steady]},route());
  assert.equal(summary.routeChoice,'steady');
  assert.equal(summary.routeLabel,'安全路を選択');
  assert.equal(summary.remainingMin,2);
  assert.equal(summary.remainingMax,2);
});

test('CLR-3 pressure summary recognizes the 6-battle route and its extra canonical fight',()=>{
  const summary=adventure4Clr3RunSummary({temporaryFlags:flagsFor('clr1-battle-1','clr1-battle-2','clr1-battle-3'),visitedNodeIds:[CLR2_BRANCH_NODE_IDS.pressure]},route());
  assert.equal(summary.routeChoice,'pressure');
  assert.equal(summary.routeLabel,'圧力路を選択');
  assert.equal(summary.remainingMin,3);
  assert.equal(summary.remainingMax,3);
});

test('CLR-3 reports zero remaining battles at the end of either completed path',()=>{
  const steady=adventure4Clr3RunSummary({temporaryFlags:flagsFor('clr1-battle-1','clr1-battle-2','clr1-battle-3','clr1-battle-5','clr1-battle-6'),visitedNodeIds:[CLR2_BRANCH_NODE_IDS.steady]},route());
  const pressure=adventure4Clr3RunSummary({temporaryFlags:flagsFor('clr1-battle-1','clr1-battle-2','clr1-battle-3','clr1-battle-4','clr1-battle-5','clr1-battle-6'),visitedNodeIds:[CLR2_BRANCH_NODE_IDS.pressure]},route());
  assert.equal(steady.remainingLabel,'残り0戦');
  assert.equal(pressure.remainingLabel,'残り0戦');
});

test('CLR-3 helper is read-only and introduces no save or reward mutation',()=>{
  const source=fs.readFileSync('js/data/coreLoopClr3.js','utf8');
  assert.doesNotMatch(source,/state\.data|\.save\(|checkpointAdventure4|addItem|gold\s*[+\-]?=/);
});

test('Adventure UI surfaces the derived progress only through existing CLR-2 checkpoint tags',()=>{
  const source=fs.readFileSync('js/patches/adventureWorld4Ui.js','utf8');
  assert.match(source,/adventure4Clr3RunSummary/);
  assert.match(source,/clr2-aftermath/);
  assert.match(source,/run\.progressLabel/);
  assert.match(source,/run\.remainingLabel/);
});
