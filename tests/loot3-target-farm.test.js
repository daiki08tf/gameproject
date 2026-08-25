import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../js/patches/combat2ElementAffixes.js';
import { buildWorld2KeyStage, world2LootProfile } from '../js/data/world2Stages.js';
import { steerRealmAffix } from '../js/patches/loot3RealmTargetFarm.js';
import { equipment3Presentation, equipment3SpecialLines, equipment3DropHeadline } from '../js/data/equipment3Presentation.js';

test('Heaven and Underworld expose materially different Loot 3 profiles', () => {
  const heaven=world2LootProfile('celestial'),hell=world2LootProfile('infernal'),anomaly=world2LootProfile('anomaly');
  assert.ok(heaven.preferredAffixIds.includes('element_light_dmg'));
  assert.ok(hell.preferredAffixIds.includes('element_dark_dmg'));
  assert.ok(hell.preferredAffixIds.includes('element_fire_dmg'));
  assert.ok(hell.cursedChanceMult>1);
  assert.ok(heaven.legendaryChanceAdd>0);
  assert.equal(anomaly.informationalOnly,true);
  assert.equal(anomaly.targetAffixChance,0);
});

test('key dungeons carry profiles and real drop multipliers', () => {
  const heaven=buildWorld2KeyStage('celestial'),hell=buildWorld2KeyStage('infernal');
  assert.equal(heaven.keyDungeon,true);
  assert.equal(hell.keyDungeon,true);
  assert.ok(heaven.dropMult>1);
  assert.ok(hell.dropMult>heaven.dropMult);
  assert.equal(heaven.loot3Profile.label,world2LootProfile('celestial').label);
  const src=fs.readFileSync(new URL('../js/patches/endgameDropContextFix.js',import.meta.url),'utf8');
  assert.match(src,/stage\.keyDungeon/);
  assert.match(src,/preferredAffixIds/);
});

test('realm steering changes one Affix through canonical IP quality without losing Greater', () => {
  const inst={itemId:'wp_sword_l',itemPower:4200,affixTier:5,affixes:[{id:'atk_pct',rarity:'rare',roll:7,greater:true},{id:'def_pct',rarity:'rare',roll:7}]};
  const changed=steerRealmAffix(inst,{world2KeyType:'celestial',targetFarm:'天界テスト',preferredAffixIds:['element_light_dmg'],targetAffixChance:1},'wp_sword_l#777');
  assert.equal(changed,true);
  assert.ok(inst.affixes.some(a=>a.id==='element_light_dmg'));
  assert.equal(inst.affixes.filter(a=>a.greater).length,1);
  assert.equal(inst.targetFarmHit,true);
});

test('anomaly remains informational and cannot steer loot', () => {
  const inst={itemPower:6200,affixes:[{id:'atk_pct',rarity:'epic',roll:10}]};
  assert.equal(steerRealmAffix(inst,{informationalOnly:true,preferredAffixIds:['element_dark_dmg'],targetAffixChance:1},'x#1'),false);
  assert.equal(inst.affixes[0].id,'atk_pct');
});

test('target hit is visible even when the item is not otherwise special', () => {
  const item={id:'test',name:'試作装備',slot:'weapon',rarity:'rare'};
  const p=equipment3Presentation(item,{itemPower:800,affixTier:1,targetFarm:'天界：光Build',targetFarmHit:true,affixes:[{id:'element_light_dmg',rarity:'rare',roll:8}]});
  assert.ok(equipment3SpecialLines(p)[0].includes('TARGET HIT'));
  assert.match(equipment3DropHeadline(p),/TARGET DROP/);
});
