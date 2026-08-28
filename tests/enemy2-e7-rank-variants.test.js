import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import {
  ENEMY_RANK_LEVEL_BANDS,markGenericElite,markRare,finalizeGenericEliteLevel,
  rareChanceFor,planRareOverrideTypes,chooseEnvironmentalVariant,applyEnvironmentalVariant,
} from '../js/data/enemyRankVariants2.js';

const stage={id:'e7-test',recLevel:100,encounterPool:{
  rareChance:.04,rareTypes:[{type:'ch1_rare',weight:1}],regionTags:['grassland'],variantChance:.10,
}};

function enemy(overrides={}){return {name:'スライム',role:'normal',speciesId:'global:slime',boss:false,elite:false,rareIdentity:false,baseLevel:100,level:100,hp:100,maxHp:100,atk:50,def:20,spd:80,xp:10,gold:10,...overrides};}

test('E7 rank bands match authored Rare and Elite bounds',()=>{
  assert.deepEqual(ENEMY_RANK_LEVEL_BANDS.rare,{min:1.15,max:1.35});
  assert.deepEqual(ENEMY_RANK_LEVEL_BANDS.elite,{min:1.20,max:1.45});
});

test('generic Elite is a separate rank and never reuses Abyss enemy.elite',()=>{
  const e=enemy();
  markGenericElite(e);
  assert.equal(e.rank,'elite');
  assert.equal(e.genericElite,true);
  assert.equal(e.elite,false);
  assert.equal(e.hp,125);
  finalizeGenericEliteLevel(e,stage,()=>0);
  assert.equal(e.level,120);
  assert.equal(e.elite,false);
  assert.ok(e.hp>=150);
});

test('historical Abyss Elite flag is never converted into generic Elite',()=>{
  const e=enemy({elite:true,hp:200});
  markGenericElite(e);
  assert.equal(e.elite,true);
  assert.equal(e.genericElite,undefined);
  assert.equal(e.hp,200);
});

test('Chapter Rare requires explicit Rare-capable pool and rolls 115–135% level',()=>{
  const e=enemy({rareIdentity:true,name:ENEMY_TYPES.ch1_rare.name});
  markRare(e,stage,()=>.999999);
  assert.equal(e.rank,'rare');
  assert.equal(e.rare,true);
  assert.equal(e.level,135);

  assert.equal(rareChanceFor(stage.encounterPool,{rank:0}),.04);
  assert.equal(rareChanceFor(stage.encounterPool,{rank:5}),.06);
  const rolls=[0,.5,.5];
  const overrides=planRareOverrideTypes(stage,{type:'grunt',count:3},ENEMY_TYPES,{rank:0},()=>rolls.shift()??0);
  assert.equal(overrides.length,3);
  assert.equal(overrides.filter(Boolean).length,1);
  assert.equal(overrides.find(Boolean),'ch1_rare');
  assert.equal(planRareOverrideTypes({...stage,encounterPool:{...stage.encounterPool,rareTypes:[]}},{type:'grunt',count:3},ENEMY_TYPES,{rank:0},()=>0),null);
});

test('Bosses cannot be converted through generic Rare planning',()=>{
  assert.equal(planRareOverrideTypes(stage,{type:'boss_orcking',count:1},ENEMY_TYPES,{rank:5},()=>0),null);
});

test('environmental Variant keeps species identity and applies only bounded flavor modifiers',()=>{
  const e=enemy();
  const rolls=[0,.2];
  const variant=chooseEnvironmentalVariant(stage.encounterPool,e,()=>rolls.shift()??0);
  assert.equal(variant.id,'grassland_windswept');
  const speciesBefore=e.speciesId;
  applyEnvironmentalVariant(e,variant);
  assert.equal(e.speciesId,speciesBefore);
  assert.equal(e.variantId,'grassland_windswept');
  assert.equal(e.name,'風渡りスライム');
  assert.ok(e.atk<=52);
  assert.ok(e.spd<=85);
  assert.ok(e.xp<=11);
});
