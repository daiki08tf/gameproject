import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementChronicle.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementChronicle.js','utf8');
const ui=fs.readFileSync('js/patches/settlementChronicleUi.js','utf8');
const home=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('S17 defines trophy museum and chronicle exhibits',()=>{
 for(const id of ['bosses','abyss','worldTier','uniques','generations'])assert.match(data,new RegExp(`id:'${id}'`));
 assert.match(data,/トロフィールーム/);assert.match(data,/博物館/);assert.match(data,/図書館/);
});

test('S17 reads canonical progress and excludes Arena bosses',()=>{
 assert.match(runtime,/activeWorldTier/);assert.match(runtime,/abyssBestDepth/);assert.match(runtime,/bountyUniqueCollection/);assert.match(runtime,/inheritanceHistory/);
 assert.match(runtime,/!ch\.arenaTraining/);assert.match(runtime,/s\.boss&&!s\.arenaTraining/);
});

test('S17 is presentation only and does not alter denominator or rewards',()=>{
 assert.doesNotMatch(runtime,/gainGold|gainExp|addItem|addManastone|rewardMult|dropMult/);
 assert.doesNotMatch(runtime,/codex.*total|denominator/i);
 assert.doesNotMatch(runtime,/setInterval|setTimeout/);
 assert.doesNotMatch(runtime,/root\.chronicle|__settlement3.*chronicle/);
});

test('S17 UI stays inside Settlement and adds no Home button',()=>{
 assert.match(ui,/settlementContent/);assert.match(ui,/data-settlement-chronicle/);
 assert.doesNotMatch(ui,/goSettlementChronicleBtn/);
 assert.match(home,/\.\/settlementChronicle\.js/);assert.match(home,/\.\/settlementChronicleUi\.js/);
});
