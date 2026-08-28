import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {enemyAffinityFamily,enemyAffinityProfile,affinityMultiplierFromResist,affinityTier} from '../js/data/enemyAffinity2.js';
import {elementMultiplier} from '../js/data/combat2Elements.js';

async function src(p){return readFile(new URL(`../${p}`,import.meta.url),'utf8');}

test('global species normalize into combat affinity families',()=>{
  assert.equal(enemyAffinityFamily({speciesId:'slime',speciesFamily:'slime',name:'スライム'}),'slime');
  assert.equal(enemyAffinityFamily({speciesId:'bat',speciesFamily:'bat',name:'コウモリ'}),'beast');
  assert.equal(enemyAffinityFamily({speciesId:'toxic_mushroom',speciesFamily:'mushroom',name:'毒キノコ'}),'plant');
  assert.equal(enemyAffinityFamily({speciesId:'wandering_armor',speciesFamily:'armor',name:'彷徨う鎧'}),'construct');
});

test('family affinities create readable bounded weaknesses and resistances',()=>{
  assert.equal(elementMultiplier('fire',{speciesId:'slime',name:'スライム'}),1.20);
  assert.equal(elementMultiplier('poison',{speciesId:'slime',name:'スライム'}),.80);
  assert.equal(elementMultiplier('light',{speciesId:'skeleton',name:'スケルトン'}),1.30);
  assert.equal(elementMultiplier('lightning',{speciesId:'golem',name:'ゴーレム'}),1.25);
  assert.equal(elementMultiplier('poison',{speciesId:'golem',name:'ゴーレム'}),.65);
});

test('environment variants modify the base family instead of replacing it',()=>{
  const ash=enemyAffinityProfile({speciesId:'slime',name:'灰熱のスライム',variantId:'fire_ash'});
  assert.equal(ash.family,'slime');
  assert.equal(ash.resist.fire,.02);
  assert.equal(ash.resist.ice,-.18);
  assert.equal(elementMultiplier('ice',{speciesId:'slime',name:'灰熱のスライム',variantId:'fire_ash'}),1.18);
});

test('authored elementResist remains authoritative and stays inside Combat 2.0\'s existing 0.65-1.55 bound',()=>{
  // Authored elementResist must be able to reach the full existing final
  // multiplier range (0.65-1.55), not the narrower -0.45..0.35 range used to
  // tune auto-inferred family/variant affinities. -0.55 is the resist value
  // that produces the existing top end (1 - (-0.55) = 1.55).
  const p=enemyAffinityProfile({speciesId:'skeleton',elementResist:{light:-.9,dark:.9}});
  assert.equal(p.resist.light,-.55);
  assert.equal(p.resist.dark,.35);
  assert.equal(affinityMultiplierFromResist(p.resist.light),1.55);
  assert.equal(affinityMultiplierFromResist(p.resist.dark),.65);
});

test('affinity tiers separate discovery-grade weak and resistant hits',()=>{
  assert.equal(affinityTier(1.30),'weakMajor');
  assert.equal(affinityTier(1.20),'weak');
  assert.equal(affinityTier(.80),'resist');
  assert.equal(affinityTier(.65),'resistMajor');
  assert.equal(affinityTier(1.05),'neutral');
});

test('combat runtime records non-neutral affinity observations',async()=>{
  const s=await src('js/patches/combat2ElementCore.js');
  assert.match(s,/markEnemyAffinityObserved/);
  assert.match(s,/affinityTier/);
  assert.match(s,/affinityTier:tier/);
});

test('Codex analysis stores full affinity profile while ordinary hits reveal only observed elements',async()=>{
  const knowledge=await src('js/patches/codexEnemyKnowledge.js');
  const ui=await src('js/patches/codexUi.js');
  assert.match(knowledge,/observedAffinities/);
  assert.match(knowledge,/affinityProfile=enemyAffinityProfile/);
  assert.match(knowledge,/affinityKnown=true/);
  assert.match(ui,/Affinity：/);
  assert.match(ui,/弱点は属性攻撃/);
});
