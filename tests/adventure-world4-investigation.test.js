import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import '../js/patches/adventureWorld4InvestigationRuntime.js';
import { ADVENTURE4_TRACE_TYPES,ADVENTURE4_INVESTIGATION_CATALOG,normalizeAdventure4InvestigationCatalog,deriveAdventure4Clues,adventure4InvestigationBoard } from '../js/data/adventureWorld4Investigation.js';
import { buildAdventure4PilotSceneCatalog,resolveAdventure4SceneChoice } from '../js/data/adventureWorld4Scenes.js';
import { buildAdventure4PilotRoute } from '../js/data/adventureWorld4Pilot.js';
import '../js/patches/adventureWorld4SceneRuntime.js';

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.world2={discoveries:{legacy:{name:'既存Discovery'}},flags:{},eventsSeen:{},eventChains:{}};
  state.data.stageProgress={};
}

const chainCatalog=normalizeAdventure4InvestigationCatalog({
  traces:[
    {id:'m',regionId:'frontier',type:'monster',name:'爪痕'},
    {id:'h',regionId:'frontier',type:'human',name:'靴跡'},
    {id:'a',regionId:'frontier',type:'ancient',name:'古代文字'},
    {id:'r',regionId:'frontier',type:'rift',name:'境界焼け'},
    {id:'s',regionId:'frontier',type:'secret',name:'隠された印'},
  ],
  clues:[
    {id:'c1',regionId:'frontier',name:'二つの足跡',summary:'爪痕と靴跡は同じ方向へ続く。',requiresTraces:['m','h']},
    {id:'c2',regionId:'frontier',name:'追跡の意味',summary:'古代文字と先の手掛かりが結び付いた。',requiresTraces:['a'],requiresClues:['c1']},
  ],
});

test('W8 defines Monster/Human/Ancient/Rift/Secret trace families',()=>{
  assert.deepEqual(ADVENTURE4_TRACE_TYPES,['monster','human','ancient','rift','secret']);
  assert.deepEqual(chainCatalog.traces.map(trace=>trace.type),ADVENTURE4_TRACE_TYPES);
});

test('W8 connects evidence into deterministic multi-step Clue chains',()=>{
  assert.deepEqual(deriveAdventure4Clues(chainCatalog,{traces:{m:{},h:{}},clues:{}}).map(x=>x.id),['c1']);
  assert.deepEqual(deriveAdventure4Clues(chainCatalog,{traces:{m:{},h:{},a:{}},clues:{}}).map(x=>x.id),['c1','c2']);
  assert.deepEqual(deriveAdventure4Clues(chainCatalog,{traces:{m:{}},clues:{}}),[]);
});

test('W8 board exposes only recorded evidence and never reveals unknown Secret counts',()=>{
  const board=adventure4InvestigationBoard(chainCatalog,{traces:{m:{at:1}},clues:{}},[{id:'frontier',name:'開拓辺境'}]);
  assert.equal(board.length,1);
  assert.equal(board[0].traces.length,1);
  assert.equal(board[0].traces[0].name,'爪痕');
  assert.equal(board[0].traces.some(trace=>trace.id==='s'),false);
  assert.equal('total' in board[0],false);
});

test('W8 persists Trace/Clue knowledge under world2 without polluting Discovery authority',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  const m=chainCatalog.traces.find(x=>x.id==='m'),h=chainCatalog.traces.find(x=>x.id==='h');
  state.recordAdventure4Trace(m,{catalog:chainCatalog});
  const second=state.recordAdventure4Trace(h,{catalog:chainCatalog});
  assert.deepEqual(second.derivedClues,['c1']);
  assert.ok(state.data.world2.investigation.traces.m);
  assert.ok(state.data.world2.investigation.clues.c1);
  assert.deepEqual(state.adventure4Session().cluesThisRun,['c1']);
  assert.deepEqual(state.data.world2.discoveries,{legacy:{name:'既存Discovery'}});
});

test('W8 legacy saves backfill investigation records safely',()=>{
  reset();delete state.data.world2.investigation;
  const records=state.adventure4InvestigationRecords();
  assert.deepEqual(records,{traces:{},clues:{}});
});

test('W8 pilot investigation records a real Trace only in its authored Region',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  const region={id:'frontier',name:'開拓辺境'},route=buildAdventure4PilotRoute(region,{routeEntry:{stageId:'1-1',stageName:'草原'}});
  const scene=buildAdventure4PilotSceneCatalog(region,route)[0];
  const resolution=resolveAdventure4SceneChoice(scene,'resolve-return-inspected','continue-return-inspected',{});
  const applied=state.applyAdventure4SceneResolution(resolution);
  assert.equal(applied.ok,true);
  assert.ok(state.data.world2.investigation.traces['frontier-pilot-fresh-tracks']);

  const other={id:'elemental',name:'四境連峰'},otherRoute=buildAdventure4PilotRoute(other,{routeEntry:{stageId:'5-1',stageName:'火山路'}});
  const otherScene=buildAdventure4PilotSceneCatalog(other,otherRoute)[0];
  const otherResolution=resolveAdventure4SceneChoice(otherScene,'resolve-return-inspected','continue-return-inspected',{});
  assert.equal(otherResolution.consequences.some(effect=>effect.type==='trace'),false);
});

test('W8 Settlement UI is an evidence-connection board, not a new quest entrance',()=>{
  const ui=fs.readFileSync(new URL('../js/patches/adventureWorld4InvestigationUi.js',import.meta.url),'utf8');
  const nav=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  assert.match(ui,/情報をつなぐ/);
  assert.match(ui,/settlementResearchContent/);
  assert.match(ui,/未知の痕跡やSecretの件数はここでは表示しない/);
  assert.match(nav,/adventureWorld4InvestigationUi/);
  assert.doesNotMatch(nav,/goInvestigationBtn/);
  assert.ok(ADVENTURE4_INVESTIGATION_CATALOG.traces.some(trace=>trace.id==='frontier-pilot-fresh-tracks'));
});
