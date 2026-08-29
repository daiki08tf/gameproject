import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync('js/data/settlementIdentity.js','utf8');
const runtime=fs.readFileSync('js/patches/settlementIdentity.js','utf8');
const ui=fs.readFileSync('js/patches/settlementIdentityUi.js','utf8');
const nav=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('S13 defines four switchable city policies and four factions',()=>{
 for(const id of ['trade','research','defense','coexistence'])assert.match(data,new RegExp(`id:'${id}'`));
 for(const id of ['guild','adventurers','academy','tamers'])assert.match(data,new RegExp(`id:'${id}'`));
});

test('S13 policy switching is reversible and has no permanent specialization lock',()=>{
 assert.match(runtime,/setSettlementPolicy/);
 assert.match(runtime,/clearSettlementPolicy/);
 assert.doesNotMatch(runtime,/permanent|irreversible|lockedPolicy|onceOnly/);
});

test('S13 favors content tendencies rather than numeric reward multipliers',()=>{
 assert.match(runtime,/settlementPolicyBias/);
 assert.match(data,/focus:'market'/);
 assert.match(data,/focus:'research'/);
 assert.match(data,/focus:'defense'/);
 assert.match(data,/focus:'ranch'/);
 assert.doesNotMatch(runtime,/goldMult|dropMult|expMult|damageMult|hpMult/);
});

test('S13 stores compact identity metadata under settlementBuildings __settlement3',()=>{
 assert.match(runtime,/__settlement3/);
 assert.match(runtime,/identity/);
 assert.match(runtime,/factionStanding/);
 assert.doesNotMatch(runtime,/state\.data\.settlementIdentity\s*=/);
});

test('S13 UI remains inside Settlement and creates no Home button',()=>{
 assert.match(ui,/settlementContent/);
 assert.match(ui,/data-settlement-identity|dataset\.settlementIdentity/);
 assert.match(nav,/settlementIdentity\.js/);
 assert.match(nav,/settlementIdentityUi\.js/);
 assert.doesNotMatch(nav,/goSettlementIdentityBtn/);
});
