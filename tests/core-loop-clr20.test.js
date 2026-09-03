import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import { buildWorld4RegionCatalog } from '../js/data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute } from '../js/data/adventureWorld4Pilot.js';
import { BOUNTY2_STAGES } from '../js/data/bounty2.js';

function source(path){return fs.readFileSync(path,'utf8');}
function completedRoute(region){return buildAdventure4PilotRoute(region,{status:'completed',routeEntry:null},{worldTierRank:0});}

test('CLR-20 keeps Stage-first Hunt limited to canonical non-branch non-bounty Story stages',()=>{
  const ui=source('js/patches/stageFirstNavigationUi.js');
  assert.match(ui,/stage\.branch\|\|stage\.bounty\|\|!state\.isStageCleared/);
  assert.match(ui,/progress\.status!=='completed'/);
  assert.match(ui,/state\.startAdventure4\?\.\(\{regionId:context\.region\.id,returnTarget:'home'\}\)/);
  assert.match(ui,/state\.resumeAdventure4/);
});

test('CLR-20 Region Hunt routes contain only canonical Region-owned Stage ids, not Endgame ids',()=>{
  for(const region of buildWorld4RegionCatalog(CHAPTERS)){
    const route=completedRoute(region);
    const owned=new Set(CHAPTERS.filter(ch=>region.chapterNumbers.includes(Number(ch.num))).flatMap(ch=>ch.stages.map(stage=>stage.id)));
    const combat=route.nodes.filter(node=>node.stageId);
    for(const node of combat){
      assert.ok(owned.has(node.stageId),`${region.id} leaked non-Region stage ${node.stageId}`);
      assert.doesNotMatch(node.stageId,/^(rift-|secret-|machine-world-|bounty-)/);
    }
  }
});

test('CLR-20 keeps Abyss Home navigation independent from Stage-first Adventure entry',()=>{
  const home=source('js/patches/homeNavigation.js');
  const ui=source('js/patches/stageFirstNavigationUi.js');
  assert.match(home,/buttons: \['goMonsterCodexBtn', 'goAbyssBtn', 'goSettlementBtn', 'goSpellBtn'\]/);
  assert.match(home,/const adventure = buttons\.get\('goStageBtn'\)/);
  assert.match(ui,/target\.closest\('#goAbyssBtn'\)/);
  assert.doesNotMatch(ui,/launchStageFirstHunt\([^)]*goAbyssBtn/);
});

test('CLR-20 does not import Endgame builders into Region Hunt authority',()=>{
  const pilot=source('js/data/adventureWorld4Pilot.js');
  const clr19=source('js/data/coreLoopClr19.js');
  const combined=`${pilot}\n${clr19}`;
  for(const forbidden of [
    'buildAbyssStage',
    'buildRiftStage',
    'buildSecretRealmStage',
    'phase9MachineWorld',
    'MACHINE_WORLD_STAGES',
    'BOUNTY2_STAGES',
    'nemesis3',
    'NEMESIS_MAX_LEVEL',
  ]) assert.doesNotMatch(combined,new RegExp(forbidden));
});

test('CLR-20 preserves existing Endgame identity flags and authorities',()=>{
  const rift=source('js/data/riftStages.js');
  const secret=source('js/data/secretRealms.js');
  const machine=source('js/patches/phase9MachineWorldRuntime.js');
  const nemesis=source('js/data/nemesis3.js');
  assert.match(rift,/id:`rift-\$\{key\.id\}`/);
  assert.match(rift,/isRift:true/);
  assert.match(secret,/secretRealm:true/);
  assert.match(machine,/phase9MachineWorldProgress/);
  assert.match(machine,/id:'machine_world'/);
  assert.match(nemesis,/export const NEMESIS_MAX_LEVEL=15/);
  assert.ok(BOUNTY2_STAGES.length>0);
  assert.ok(BOUNTY2_STAGES.every(stage=>stage.bounty===true&&stage.branch===true));
});

test('CLR-20 adds no bridge save root, Hunt currency, stamina, or duplicate World Tier authority',()=>{
  const ui=source('js/patches/stageFirstNavigationUi.js');
  const pilot=source('js/data/adventureWorld4Pilot.js');
  const clr19=source('js/data/coreLoopClr19.js');
  const combined=`${ui}\n${pilot}\n${clr19}`;
  assert.doesNotMatch(combined,/endgameBridge|huntCurrency|huntLevel|huntSave|stamina|energy/i);
  assert.doesNotMatch(combined,/newWorldTier|huntWorldTier|regionWorldTier/i);
});
