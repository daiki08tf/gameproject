import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ENEMY3_ELITE_AFFIXES,isEnemy3GenericElite,chooseEnemy3EliteAffix,
  assignEnemy3EliteAffix,enemy3EliteStatMultiplier,enemy3EliteRegenAmount,
} from '../js/data/enemy3EliteAffixes.js';

test('B4 exposes four bounded generic Elite affixes',()=>{
  assert.deepEqual(Object.keys(ENEMY3_ELITE_AFFIXES),['regenerating','frenzied','bulwark','swift']);
  const elite={genericElite:true,rank:'elite',hp:100,maxHp:100};
  assert.equal(chooseEnemy3EliteAffix(elite,()=>0).id,'regenerating');
  assert.equal(chooseEnemy3EliteAffix(elite,()=>.999).id,'swift');
});

test('B4 never applies generic affixes to Abyss elite, Rare, or Boss',()=>{
  assert.equal(isEnemy3GenericElite({genericElite:true,rank:'elite',elite:true}),false);
  assert.equal(isEnemy3GenericElite({genericElite:true,rank:'elite',rareIdentity:true}),false);
  assert.equal(isEnemy3GenericElite({genericElite:true,rank:'elite',boss:true}),false);
  assert.equal(assignEnemy3EliteAffix({genericElite:true,rank:'elite',elite:true},()=>0).enemy3EliteAffix,undefined);
});

test('B4 stat and regeneration effects stay bounded',()=>{
  const frenzied={genericElite:true,rank:'elite',hp:40,maxHp:100,enemy3EliteAffix:ENEMY3_ELITE_AFFIXES.frenzied};
  assert.equal(enemy3EliteStatMultiplier(frenzied,'atk'),1.18);
  frenzied.hp=41;
  assert.equal(enemy3EliteStatMultiplier(frenzied,'atk'),1);
  assert.equal(enemy3EliteStatMultiplier({enemy3EliteAffix:ENEMY3_ELITE_AFFIXES.bulwark},'def'),1.16);
  assert.equal(enemy3EliteStatMultiplier({enemy3EliteAffix:ENEMY3_ELITE_AFFIXES.swift},'spd'),1.14);
  assert.equal(enemy3EliteRegenAmount({hp:50,maxHp:100,dead:false,enemy3EliteAffix:ENEMY3_ELITE_AFFIXES.regenerating}),4);
});

test('B4 runtime is loaded without touching reward semantics',()=>{
  const runtime=readFileSync(new URL('../js/patches/enemy3EliteAffixes.js',import.meta.url),'utf8');
  const bridge=readFileSync(new URL('../js/patches/enemy3Targeting.js',import.meta.url),'utf8');
  assert.match(bridge,/import '\.\/enemy3EliteAffixes\.js'/);
  assert.match(runtime,/generic Elite affix runtime/);
  assert.doesNotMatch(runtime,/addAbyssShards|gainGold|gainExp|_grantKillRewards/);
});
