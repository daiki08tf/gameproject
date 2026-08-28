import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ENEMY3_RARE_BEHAVIORS,isEnemy3Rare,chooseEnemy3RareBehavior,
  assignEnemy3RareBehavior,enemy3RareStatMultiplier,enemy3RareLeechAmount,
} from '../js/data/enemy3RareBehaviors.js';

test('B5 exposes four bounded Rare behaviors',()=>{
  assert.deepEqual(Object.keys(ENEMY3_RARE_BEHAVIORS),['predator','leech','survivor','ambusher']);
  const rare={rareIdentity:true,rare:true,rank:'rare',hp:100,maxHp:100};
  assert.equal(chooseEnemy3RareBehavior(rare,()=>0).id,'predator');
  assert.equal(chooseEnemy3RareBehavior(rare,()=>.999).id,'ambusher');
});

test('B5 applies only to true Rare identities',()=>{
  assert.equal(isEnemy3Rare({rareIdentity:true,rank:'rare'}),true);
  assert.equal(isEnemy3Rare({rare:true,rank:'rare'}),true);
  assert.equal(isEnemy3Rare({rareIdentity:true,rank:'rare',boss:true}),false);
  assert.equal(isEnemy3Rare({rareIdentity:true,rank:'rare',genericElite:true}),false);
  assert.equal(isEnemy3Rare({rareIdentity:true,rank:'rare',elite:true}),false);
  assert.equal(assignEnemy3RareBehavior({genericElite:true,rank:'elite'},()=>0).enemy3RareBehavior,undefined);
});

test('B5 contextual stat behavior stays bounded',()=>{
  const player={hp:40,maxHp:100};
  const predator={hp:100,maxHp:100,enemy3RareBehavior:ENEMY3_RARE_BEHAVIORS.predator};
  assert.equal(enemy3RareStatMultiplier(predator,'atk',player),1.18);
  player.hp=41;
  assert.equal(enemy3RareStatMultiplier(predator,'atk',player),1);

  const survivor={hp:35,maxHp:100,enemy3RareBehavior:ENEMY3_RARE_BEHAVIORS.survivor};
  assert.equal(enemy3RareStatMultiplier(survivor,'def',player),1.20);
  assert.equal(enemy3RareStatMultiplier(survivor,'spd',player),1.10);
  survivor.hp=36;
  assert.equal(enemy3RareStatMultiplier(survivor,'def',player),1);

  const ambusher={hp:100,maxHp:100,enemy3RareFirstTurn:true,enemy3RareBehavior:ENEMY3_RARE_BEHAVIORS.ambusher};
  assert.equal(enemy3RareStatMultiplier(ambusher,'atk',player),1.25);
  ambusher.enemy3RareFirstTurn=false;
  assert.equal(enemy3RareStatMultiplier(ambusher,'atk',player),1);
});

test('B5 leech uses damage as a trigger but heals from max HP',()=>{
  const leech={hp:50,maxHp:100,dead:false,enemy3RareBehavior:ENEMY3_RARE_BEHAVIORS.leech};
  assert.equal(enemy3RareLeechAmount(leech,1),5);
  assert.equal(enemy3RareLeechAmount(leech,0),0);
  leech.hp=98;
  assert.equal(enemy3RareLeechAmount(leech,999),2);
});

test('B5 runtime is loaded without touching rewards or encounter rates',()=>{
  const runtime=readFileSync(new URL('../js/patches/enemy3RareBehaviors.js',import.meta.url),'utf8');
  const bridge=readFileSync(new URL('../js/patches/enemy3Targeting.js',import.meta.url),'utf8');
  assert.match(bridge,/import '\.\/enemy3RareBehaviors\.js'/);
  assert.match(runtime,/Rare-only behavior runtime/);
  assert.doesNotMatch(runtime,/gainGold|gainExp|_grantKillRewards|rareChance|addAbyssShards/);
});
