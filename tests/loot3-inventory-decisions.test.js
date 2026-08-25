import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { decisionProfile } from '../js/patches/loot3InventoryDecisions.js';

function fakeTarget(instances, scores){
  return {
    data:{weaponInstances:instances,gearInstances:{}},
    equipmentInstance(id){return this.data.weaponInstances[id]||null;},
    equipmentPowerScore(id){return scores[id]??100;},
  };
}

test('Build Affix adds bounded strategic value without replacing raw score',()=>{
  const id='wp_sword_l#9001';
  const target=fakeTarget({[id]:{itemId:'wp_sword_l',itemPower:1800,affixTier:2,affixes:[{id:'build_bloodedge',rarity:'legendary',roll:8}]}},{[id]:100});
  const p=decisionProfile(target,id);
  assert.equal(p.raw,100);
  assert.ok(p.strategic>100);
  assert.ok(p.reasons.some(r=>r.startsWith('BUILD')));
  assert.ok(p.strategicPct<=0.35);
});

test('plain item receives no artificial strategic bonus',()=>{
  const id='wp_sword_l#9002';
  const target=fakeTarget({[id]:{itemId:'wp_sword_l',itemPower:900,affixTier:1,affixes:[{id:'atk_pct',rarity:'rare',roll:7}]}},{[id]:120});
  const p=decisionProfile(target,id);
  assert.equal(p.strategicPct,0);
  assert.equal(p.strategic,120);
});

test('main runtime loads both realm chase and inventory decision patches',()=>{
  const src=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');
  assert.match(src,/loot3InventoryDecisions\.js/);
  assert.match(src,/uniqueTrialFoundation\.js';\nimport '\.\/patches\/loot3RealmChaseRewards\.js'/);
});
