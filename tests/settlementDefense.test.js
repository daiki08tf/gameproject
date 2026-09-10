import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementDefense.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementDefense.js','utf8');
const ui=fs.readFileSync('js/patches/settlementDefenseUi.js','utf8');
const nav=fs.readFileSync('js/patches/homeNavigation.js','utf8');
const main=fs.readFileSync('js/main.js','utf8');

test('S11 defines monster bandit Nemesis and rift invasions',()=>{for(const id of ['beastRaid','banditRaid','nemesisRaid','riftCorruption'])assert.match(data,new RegExp(`id:'${id}'`));});
test('S11 defines wall watchpost and traps without replacing core buildings',()=>{for(const id of ['wall','watchpost','traps'])assert.match(data,new RegExp(`id:'${id}'`));assert.doesNotMatch(runtime,/state\.data\.settlementBuildings\.(wall|watchpost|traps)\s*=/);});
// Previously these incidents only opened a `pending` flag and showed an alert
// promising a hand-off to the existing battle system that never actually
// happened (Future Ideas #5/#9). This now really routes into the existing
// BattleEngine/TextBattleScreen via main.js instead of the incident's own
// runtime doing any local combat math.
test('defense incidents build a real stage for the existing battle system instead of doing local combat math',()=>{
  assert.match(runtime,/startSettlementDefense/);
  assert.match(runtime,/prepareSettlementDefenseBattle/);
  assert.doesNotMatch(runtime,/enemyHp\s*[-+]?=|playerHp\s*[-+]?=/);
  assert.match(ui,/settlement-defense-start/);
  assert.doesNotMatch(ui,/alert\(/);
  assert.match(main,/settlement-defense-start/);
  assert.match(main,/prepareSettlementDefenseBattle/);
  assert.match(main,/startBattle\(stage,null\)/);
});
test('defense stages register into a hidden chapter by id, reusing findStage instead of a parallel lookup',()=>{
  assert.match(runtime,/id:'settlement_defense'/);
  assert.match(runtime,/hidden:true/);
  assert.doesNotMatch(runtime,/CHAPTERS\s*=\s*\[/);
});
test('Nemesis raid reuses the existing bounty2/Nemesis3 growth and scaling instead of a new enemy authority',()=>{
  assert.match(runtime,/nemesisRaidStage/);
  assert.match(runtime,/activeBountyNemesis/);
  assert.match(runtime,/bounty2:true/);
  assert.match(runtime,/bountyBaseId:bounty\.id/);
  assert.match(data,/requiresActiveNemesis:true/);
  assert.doesNotMatch(runtime,/NEMESIS_MAX_LEVEL\s*=|nemesisTraitIdsForLevel\s*\(/);
});
test('Security incidents (Future Ideas #5) reuse existing low-tier enemy types, no new enemy roster',()=>{
  for(const id of ['marketTheft','curfewBrawl'])assert.match(data,new RegExp(`id:'${id}'`));
  assert.match(data,/type:'ch2_fast'/);
  assert.match(data,/type:'ch3_normal'/);
});
test('defeat never causes permanent building level loss',()=>{assert.match(runtime,/buildingLoss:false/);assert.doesNotMatch(runtime,/settlementBuildings\[[^\]]+\]\s*[-]=|settlementBuildings\.[a-z]+\s*[-]=/);});
test('first clear rewards use existing settlement materials and cannot be farmed repeatedly',()=>{assert.match(runtime,/const first=!meta\.cleared\.includes\(id\)/);assert.match(runtime,/first\?\(this\.addSettlementMaterials/);});
test('S11 stores compact metadata under __settlement3 defense and adds no timers',()=>{assert.match(runtime,/__settlement3/);assert.match(runtime,/root\.defense/);assert.doesNotMatch(runtime,/state\.data\.settlementDefense\s*=/);assert.doesNotMatch(runtime,/Date\(|setInterval|setTimeout|daily/);});
test('S11 UI stays inside Settlement and adds no Home button',()=>{assert.match(ui,/settlementContent/);assert.match(ui,/dataset\.settlementDefense/);assert.match(ui,/<details/);assert.match(nav,/settlementDefense\.js/);assert.match(nav,/settlementDefenseUi\.js/);assert.doesNotMatch(nav,/goSettlementDefenseBtn/);});
