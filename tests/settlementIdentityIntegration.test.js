import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const market=fs.readFileSync('js/patches/settlementMarket.js','utf8');
const research=fs.readFileSync('js/patches/settlementResearch.js','utf8');
const defense=fs.readFileSync('js/patches/settlementDefense.js','utf8');

test('S13 trade policy changes market presentation tendency without reward multipliers',()=>{
 assert.match(market,/settlementPolicyBias\?\.\('market'\)/);
 assert.match(market,/policyFavored/);
 assert.match(market,/recordSettlementFactionActivity\?\.\('guild'/);
});

test('S13 research policy prioritizes evidence and records academy activity',()=>{
 assert.match(research,/settlementPolicyBias\?\.\('research'\)/);
 assert.match(research,/policy-research/);
 assert.match(research,/recordSettlementFactionActivity\?\.\('academy'/);
});

test('S13 defense policy prioritizes active threats and records adventurer activity',()=>{
 assert.match(defense,/settlementPolicyBias\?\.\('defense'\)/);
 assert.match(defense,/policyFavored/);
 assert.match(defense,/recordSettlementFactionActivity\?\.\('adventurers'/);
});
