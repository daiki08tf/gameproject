import assert from 'node:assert/strict';
import { equipment3Presentation, equipment3DropHeadline, equipment3SpecialLines } from '../js/data/equipment3Presentation.js';

const weapon={id:'test_weapon',name:'試作剣',slot:'weapon',rarity:'mythic',stats:{atk:10}};
const ancient=equipment3Presentation(weapon,{itemPower:3200,affixTier:4,affixes:[{id:'atk_pct',rarity:'ancient',roll:24}]});
assert.equal(ancient.quality,'jackpot');
assert.ok(ancient.reasons.includes('ANCIENT AFFIX'));
assert.match(equipment3DropHeadline(ancient),/JACKPOT/);

const build=equipment3Presentation(weapon,{itemPower:1800,affixTier:2,affixes:[{id:'build_bloodedge',rarity:'legendary',roll:8}]});
assert.equal(build.quality,'special');
assert.ok(build.reasons.includes('BUILD'));
assert.ok(build.reasons.includes('LEGENDARY AFFIX'));
assert.ok(equipment3SpecialLines(build)[0].includes('BUILD'));

const plain=equipment3Presentation(weapon,{itemPower:900,affixTier:1,affixes:[{id:'atk_pct',rarity:'rare',roll:7}]});
assert.equal(plain.quality,'standard');
assert.equal(equipment3DropHeadline(plain),null);

const unique=equipment3Presentation({...weapon,unique:true},null);
assert.equal(unique.quality,'jackpot');
assert.ok(unique.reasons.includes('UNIQUE'));

console.log('loot3 quality tests passed');
