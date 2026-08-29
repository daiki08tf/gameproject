import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementDefense.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementDefense.js','utf8');
const ui=fs.readFileSync('js/patches/settlementDefenseUi.js','utf8');
const nav=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('S11 defines monster bandit Nemesis and rift invasions',()=>{for(const id of ['beastRaid','banditRaid','nemesisRaid','riftCorruption'])assert.match(data,new RegExp(`id:'${id}'`));});
test('S11 defines wall watchpost and traps without replacing core buildings',()=>{for(const id of ['wall','watchpost','traps'])assert.match(data,new RegExp(`id:'${id}'`));assert.doesNotMatch(runtime,/state\.data\.settlementBuildings\.(wall|watchpost|traps)\s*=/);});
test('defense incidents produce encounter hooks instead of auto resolving combat',()=>{assert.match(runtime,/startSettlementDefense/);assert.match(runtime,/encounter/);assert.doesNotMatch(runtime,/BattleEngine|_finishBattle|enemyHp|playerHp/);assert.match(ui,/既存戦闘システム/);});
test('defeat never causes permanent building level loss',()=>{assert.match(runtime,/buildingLoss:false/);assert.doesNotMatch(runtime,/settlementBuildings\[[^\]]+\]\s*[-]=|settlementBuildings\.[a-z]+\s*[-]=/);});
test('first clear rewards use existing settlement materials and cannot be farmed repeatedly',()=>{assert.match(runtime,/const first=!meta\.cleared\.includes\(id\)/);assert.match(runtime,/first\?\(this\.addSettlementMaterials/);});
test('S11 stores compact metadata under __settlement3 defense and adds no timers',()=>{assert.match(runtime,/__settlement3/);assert.match(runtime,/root\.defense/);assert.doesNotMatch(runtime,/state\.data\.settlementDefense\s*=/);assert.doesNotMatch(runtime,/Date\(|setInterval|setTimeout|daily/);});
test('S11 UI stays inside Settlement and adds no Home button',()=>{assert.match(ui,/settlementContent/);assert.match(ui,/dataset\.settlementDefense/);assert.match(ui,/<details/);assert.match(nav,/settlementDefense\.js/);assert.match(nav,/settlementDefenseUi\.js/);assert.doesNotMatch(nav,/goSettlementDefenseBtn/);});
