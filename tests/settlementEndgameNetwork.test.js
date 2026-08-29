import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementEndgameNetwork.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementEndgameNetwork.js','utf8');
const ui=fs.readFileSync('js/patches/settlementEndgameNetworkUi.js','utf8');
const home=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('S15 covers every existing endgame lane without defining reward multipliers',()=>{
 for(const id of ['worldTier','worldEvent','abyss','rift','secretRealm','machineRealm','deepSurvey'])assert.match(data,new RegExp(`id:'${id}'`));
 assert.doesNotMatch(runtime,/dropMult|goldMult|rewardMult|itemPowerBonus\s*[:=]/);
});

test('S15 reads canonical endgame systems instead of cloning progression',()=>{
 assert.match(runtime,/activeWorldTier/);
 assert.match(runtime,/world2RealmVisibility/);
 assert.match(runtime,/world2EventChance/);
 assert.match(runtime,/abyssBestDepth/);
 assert.match(runtime,/riftKeys/);
 assert.match(runtime,/phase9MachineWorldProgress/);
 assert.match(runtime,/deepSurveyUnlocked/);
 assert.match(runtime,/settlementExpeditionState/);
});

test('S15 abyss returns are informational and never grant duplicate rewards',()=>{
 assert.match(runtime,/seenAbyssReturns/);
 assert.match(runtime,/rewardApplied:false/);
 assert.doesNotMatch(runtime,/addSettlementMaterials|data\.gold\s*[+\-]=/);
});

test('S15 stores only compact metadata under settlement3',()=>{
 assert.match(runtime,/root\.endgameNetwork/);
 assert.match(runtime,/seenAbyssReturns:\[\]/);
 assert.doesNotMatch(runtime,/state\.data\.endgameNetwork\s*=/);
});

test('S15 stays compact inside Settlement and adds no Home button',()=>{
 assert.match(ui,/settlementContent/);
 assert.match(ui,/grid-template-columns/);
 assert.doesNotMatch(ui,/go[A-Za-z]+Btn/);
 assert.match(home,/settlementEndgameNetwork\.js/);
 assert.match(home,/settlementEndgameNetworkUi\.js/);
});
