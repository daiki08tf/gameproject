import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const data=fs.readFileSync('js/data/settlementCapital.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementCapital.js','utf8');
const ui=fs.readFileSync('js/patches/settlementCapitalUi.js','utf8');
test('S18 declares Hall 20 capital content',()=>{assert.ok(data.includes('FRONTIER_CAPITAL_MIN_HALL = 20'));['ancientRelay','finalArchive','capitalBulwark','capitalConvergence'].forEach(id=>assert.ok(data.includes(id)));});
test('S18 uses a pending encounter instead of a duplicate battle engine',()=>{assert.ok(runtime.includes('pendingEncounter'));assert.ok(runtime.includes('noAutoReward:true'));assert.equal(runtime.includes('BattleEngine'),false);});
test('S18 is integrated inside Settlement',()=>{assert.ok(runtime.includes('root.capital'));assert.ok(ui.includes('#settlementContent'));assert.equal(ui.includes('goSettlementCapitalBtn'),false);});
