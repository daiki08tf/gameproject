import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementExpeditions.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementExpeditions.js','utf8');
const ui=fs.readFileSync('js/patches/settlementExpeditionsUi.js','utf8');
const home=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('S14 defines short and long expeditions with non-material leads',()=>{assert.match(data,/length:'short'/);assert.match(data,/length:'long'/);assert.match(data,/type:'rumor'/);assert.match(data,/type:'map'/);assert.match(data,/type:'npc'/);assert.match(data,/type:'event'/);});
test('S14 uses game cycle instead of real timers',()=>{assert.match(runtime,/settlementSeasonState/);assert.doesNotMatch(runtime,/Date\(|setTimeout|setInterval/);assert.match(runtime,/cycles/);});
test('S14 avoids forcing favorite companions into away teams',()=>{assert.match(runtime,/filter\(x=>!x\.favorite\)/);});
test('S14 stores compact metadata under settlement3 and uses existing material rewards',()=>{assert.match(runtime,/root\.expeditions/);assert.match(runtime,/active:null,completed:\[\],discoveries:\[\]/);assert.match(runtime,/addSettlementMaterials/);});
test('S14 stays inside Settlement and adds no Home button',()=>{assert.match(ui,/settlementContent/);assert.doesNotMatch(ui,/go[A-Za-z]+Btn/);assert.match(home,/settlementExpeditions\.js/);assert.match(home,/settlementExpeditionsUi\.js/);});
