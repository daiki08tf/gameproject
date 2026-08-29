import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementExploration.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementExploration.js','utf8');
const ui=fs.readFileSync('js/patches/settlementExplorationUi.js','utf8');
const nav=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('S9 defines six authored settlement exploration locations',()=>{
 for(const id of ['well','graveyard','abandonedHouse','outskirtsForest','mineShaft','sewer'])assert.match(data,new RegExp(`id:'${id}'`));
 assert.match(data,/repeatable:true/);
 assert.match(data,/repeatable:false/);
});

test('S9 discovery is gated by existing settlement facility levels',()=>{
 assert.match(data,/minHall/);
 assert.match(data,/minWatch/);
 assert.match(data,/minInn/);
 assert.match(data,/minMarket/);
 assert.match(runtime,/settlementLevel/);
});

test('S9 stores only compact metadata under settlementBuildings __settlement3',()=>{
 assert.match(runtime,/__settlement3/);
 assert.match(runtime,/exploration/);
 assert.match(runtime,/discovered/);
 assert.match(runtime,/completed/);
 assert.match(runtime,/visits/);
 assert.doesNotMatch(runtime,/state\.data\.settlementExploration\s*=/);
 assert.doesNotMatch(runtime,/currency|daily|Date\(|setInterval|setTimeout/);
});

test('first completion can reward existing settlement materials while revisits cannot farm rewards',()=>{
 assert.match(runtime,/if\(first\).*addSettlementMaterials/s);
 assert.match(runtime,/gained=\{\}/);
 assert.doesNotMatch(runtime,/else\s*\{[^}]*addSettlementMaterials/s);
});

test('one-shot and revisitable exploration are separated',()=>{
 assert.match(runtime,/completed&&!location\.repeatable/);
 assert.match(runtime,/repeatable:location\.repeatable/);
 assert.match(ui,/再訪可/);
 assert.match(ui,/一度きり/);
});

test('S9 UI stays inside Settlement and creates no Home button',()=>{
 assert.match(ui,/settlementContent/);
 assert.match(ui,/dataset\.settlementExploration/);
 assert.match(ui,/<details/);
 assert.match(nav,/import '\.\/settlementExploration\.js'/);
 assert.match(nav,/import '\.\/settlementExplorationUi\.js'/);
 assert.doesNotMatch(nav,/goSettlementExplorationBtn/);
});

test('S9 refreshes resident eligibility after discoveries without owning resident state',()=>{
 assert.match(runtime,/refreshSettlementResidents/);
 assert.doesNotMatch(runtime,/pendingResidentEvents|seenResidentEvents|meta\.residents/);
});
