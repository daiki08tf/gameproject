import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementSecrets.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementSecrets.js','utf8');
const ui=fs.readFileSync('js/patches/settlementSecretsUi.js','utf8');
const nav=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('S10 defines four authored hidden facilities',()=>{
 for(const id of ['forgeCellar','sealedVault','ancientLab','riftGate'])assert.match(data,new RegExp(`id:'${id}'`));
 for(const name of ['鍛冶屋地下','封印庫','古代研究室','異界門'])assert.match(data,new RegExp(name));
});

test('hidden facilities require S9 discoveries plus existing residents and progression evidence',()=>{
 assert.match(data,/exploration:'abandonedHouse'/);
 assert.match(data,/exploration:'graveyard'/);
 assert.match(data,/exploration:'mineShaft'/);
 assert.match(data,/exploration:'sewer'/);
 assert.match(data,/resident:'garrick'/);
 assert.match(data,/resident:'iris'/);
 assert.match(data,/resident:'orwin'/);
 assert.match(data,/resident:'valen'/);
 assert.match(data,/minCodexSeen/);
 assert.match(data,/minBossKills/);
});

test('S10 has multi-stage secret quests and a secret boss encounter hook',()=>{
 for(const id of ['buriedFlame','namesUnderStone','boundaryFormula','otherSideKnocks'])assert.match(data,new RegExp(`id:'${id}'`));
 assert.match(data,/stages:Object\.freeze/);
 assert.match(data,/kind:'secretBoss'/);
 assert.match(data,/settlementBoundaryGuardian/);
});

test('S10 stores compact state under settlementBuildings __settlement3 only',()=>{
 assert.match(runtime,/__settlement3/);
 assert.match(runtime,/root\.secrets/);
 assert.match(runtime,/facilities/);
 assert.match(runtime,/questStage/);
 assert.match(runtime,/completedQuests/);
 assert.match(runtime,/pendingEncounters/);
 assert.doesNotMatch(runtime,/state\.data\.settlementSecrets\s*=/);
 assert.doesNotMatch(runtime,/currency|daily|Date\(|setInterval|setTimeout/);
});

test('S10 reuses exploration, residents, codex and settlement material rewards',()=>{
 assert.match(runtime,/settlementExplorationState/);
 assert.match(runtime,/settlementResidents/);
 assert.match(runtime,/monsterCodex/);
 assert.match(runtime,/addSettlementMaterials/);
 assert.match(runtime,/refreshSettlementResidents/);
});

test('secret boss is exposed as an encounter hook instead of duplicating BattleEngine',()=>{
 assert.match(runtime,/pendingEncounter/);
 assert.match(runtime,/completeSettlementSecretEncounter/);
 assert.doesNotMatch(runtime,/new BattleEngine|BattleEngine\.prototype|_finishBattle/);
});

test('S10 UI remains a compact Settlement panel with no new Home button',()=>{
 assert.match(ui,/settlementContent/);
 assert.match(ui,/dataset\.settlementSecrets/);
 assert.match(ui,/<details/);
 assert.match(ui,/BOSS READY/);
 assert.match(nav,/import '\.\/settlementSecrets\.js'/);
 assert.match(nav,/import '\.\/settlementSecretsUi\.js'/);
 assert.doesNotMatch(nav,/goSettlementSecretsBtn|goHiddenFacilityBtn/);
});
