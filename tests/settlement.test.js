import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SETTLEMENT_BUILDINGS,settlementCost,settlementMaterialYield } from '../js/data/settlement.js';

test('Settlement 1.0 ships five distinct permanent facilities',()=>{assert.equal(SETTLEMENT_BUILDINGS.length,5);assert.equal(new Set(SETTLEMENT_BUILDINGS.map(x=>x.id)).size,5);assert.ok(SETTLEMENT_BUILDINGS.some(x=>x.id==='ranch'));assert.ok(SETTLEMENT_BUILDINGS.every(x=>x.maxLevel===5));});
test('building costs rise by level and use construction materials',()=>{for(const b of SETTLEMENT_BUILDINGS){const a=settlementCost(b.id,1),z=settlementCost(b.id,5);assert.ok(a&&z);assert.ok(Object.values(z).reduce((n,v)=>n+v,0)>Object.values(a).reduce((n,v)=>n+v,0));}});
test('story and Abyss clears feed different settlement materials',()=>{const story=settlementMaterialYield({recLevel:100,boss:false}),abyss=settlementMaterialYield({isAbyss:true,abyssDepth:500,boss:true});assert.ok(story.wood>0);assert.equal(story.veilstone,0);assert.ok(abyss.veilstone>0);assert.ok(abyss.ore>story.ore);});
test('Settlement hooks into hub and Ranch recruitment',()=>{const nav=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8'),rec=fs.readFileSync(new URL('../js/patches/companionRecruitment.js',import.meta.url),'utf8'),core=fs.readFileSync(new URL('../js/patches/settlementCore.js',import.meta.url),'utf8');assert.match(nav,/goSettlementBtn/);assert.match(nav,/settlementCore/);assert.match(rec,/recruitChanceBonus/);assert.match(core,/gainPartyCompanionExp/);assert.match(core,/settlementMaterials/);});
