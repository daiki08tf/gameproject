import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loot2Tier,loot2Score,salvageYield } from '../js/data/loot2.js';

test('Ancient and Primordial are strict combinations rather than new random rarity rolls',()=>{assert.equal(loot2Tier({itemPower:8500,greaterAffixCount:2,affixes:[1,2,3,4]}).id,'ancient');assert.equal(loot2Tier({itemPower:9600,greaterAffixCount:3,affixes:[1,2,3,4],legendaryEffectId:'x'}).id,'primordial');assert.equal(loot2Tier({itemPower:10000,greaterAffixCount:0,affixes:[1,2,3,4]}).id,'standard');});
test('loot score rises with IP Greater and Legendary quality',()=>{const a=loot2Score({itemPower:5000,affixes:[1,2,3]});const b=loot2Score({itemPower:9000,greaterAffixCount:2,affixes:[1,2,3,4],legendaryEffectId:'x'});assert.ok(b>a);});
test('salvage returns existing currencies and rewards jackpot recycling more',()=>{const normal=salvageYield({itemPower:2000,affixes:[1,2]});const ancient=salvageYield({itemPower:8500,greaterAffixCount:2,affixes:[1,2,3,4]});assert.ok(ancient.essence>normal.essence);assert.ok(ancient.manastone>0);});
test('shared Equipment 3 presentation surfaces Ancient and Primordial labels',()=>{const src=fs.readFileSync(new URL('../js/data/equipment3Presentation.js',import.meta.url),'utf8');assert.match(src,/PRIMORDIAL/);assert.match(src,/ANCIENT/);assert.match(src,/loot2Presentation/);});
test('Loot 2 salvage refuses equipped items and UI respects protection',()=>{const core=fs.readFileSync(new URL('../js/patches/loot2Core.js',import.meta.url),'utf8');const ui=fs.readFileSync(new URL('../js/patches/loot2Ui.js',import.meta.url),'utf8');assert.match(core,/reason:'equipped'/);assert.match(ui,/isItemLocked/);assert.match(ui,/isItemFavorite/);});
