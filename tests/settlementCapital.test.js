import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const data=fs.readFileSync('js/data/settlementCapital.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementCapital.js','utf8');
const ui=fs.readFileSync('js/patches/settlementCapitalUi.js','utf8');
const home=fs.readFileSync('js/patches/homeNavigation.js','utf8');
test('S18 is Hall 20 horizontal progression',()=>{assert.ok(data.includes('FRONTIER_CAPITAL_MIN_HALL = 20'));assert.ok(runtime.includes('Lv20以降は施設Lvを増やさず'));assert.equal(runtime.includes('hall++'),false);});
test('S18 defines capital projects and crisis hook',()=>{['ancientRelay','finalArchive','capitalBulwark','capitalConvergence'].forEach(id=>assert.ok(data.includes(id)));assert.ok(runtime.includes('pendingEncounter'));assert.ok(runtime.includes('noAutoReward:true'));assert.equal(runtime.includes('BattleEngine'),false);});
test('S18 reads canonical progress and stays in Settlement UI',()=>{['settlementEndgameSummary','settlementResearchReport','settlementDefenseSummary','abyssBestDepth','activeWorldTier'].forEach(x=>assert.ok(runtime.includes(x)));assert.ok(runtime.includes('root.capital'));assert.ok(ui.includes('#settlementContent'));assert.equal(ui.includes('goSettlementCapitalBtn'),false);assert.ok(home.includes("import './settlementCapital.js'"));assert.ok(home.includes("import './settlementCapitalUi.js'"));});
