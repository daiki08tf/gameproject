import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_COMPANION_COMBAT, bossCompanionCollateral, bossDamageToCompanion, companionNatureDamageMult, enemyDamageToCompanion } from '../js/patches/companionBattle.js';

function c(id,nature,hp=10000,def=5000){return{id,name:id,nature,traits:[],hp,maxHp:hp,def,down:false};}
function engine(companions){return{_companionBattleReady:true,companions,companion:companions[0]||null};}
function withRandom(v,fn){const old=Math.random;Math.random=()=>v;try{return fn();}finally{Math.random=old;}}

test('Boss companion tuning is bounded and special attacks are the main threat',()=>{
  assert.ok(BOSS_COMPANION_COMBAT.BASIC_CLEAVE_CHANCE>0&&BOSS_COMPANION_COMBAT.BASIC_CLEAVE_CHANCE<.5);
  assert.ok(BOSS_COMPANION_COMBAT.BASIC_HP_FLOOR<BOSS_COMPANION_COMBAT.SPECIAL_HP_FLOOR);
  assert.ok(BOSS_COMPANION_COMBAT.SPECIAL_HP_CAP<.5);
});

test('nature role mitigation is Boss-specific and does not change ordinary enemy damage',()=>{
  const cautious=c('tank','cautious'),brave=c('dps','brave'),enemy={atk:10000};
  const normalTank=withRandom(.5,()=>enemyDamageToCompanion(enemy,cautious,1));
  const normalDps=withRandom(.5,()=>enemyDamageToCompanion(enemy,brave,1));
  assert.equal(normalTank,normalDps);
  assert.ok(companionNatureDamageMult(cautious)<companionNatureDamageMult(brave));
  const opts={floorPct:.14,capPct:.32};
  const bossTank=withRandom(.5,()=>bossDamageToCompanion(enemy,cautious,1,opts));
  const bossDps=withRandom(.5,()=>bossDamageToCompanion(enemy,brave,1,opts));
  assert.ok(bossTank<bossDps);
});

test('Boss special splash threatens every living companion but ignores already down members',()=>{
  const party=[c('tank','cautious'),c('support','clever'),c('dps','brave'),c('down','balanced')];party[3].hp=0;party[3].down=true;
  const e=engine(party),boss={id:'boss',name:'Boss',boss:true,atk:5000};
  const hits=withRandom(.5,()=>bossCompanionCollateral(e,boss,{kind:'special',specialKind:'slam'}));
  assert.equal(hits.length,3);assert.ok(party.slice(0,3).every(x=>x.hp<x.maxHp));assert.equal(party[3].hp,0);
});

test('telegraph and summon turns do not secretly damage companions',()=>{
  const party=[c('a','balanced'),c('b','cautious')],e=engine(party),boss={boss:true,atk:99999};
  assert.deepEqual(bossCompanionCollateral(e,boss,{kind:'telegraph',specialKind:'slam'}),[]);
  assert.deepEqual(bossCompanionCollateral(e,boss,{kind:'summon'}),[]);
  assert.ok(party.every(x=>x.hp===x.maxHp));
});

test('Boss basic attacks can cleave one companion without replacing the player-facing attack',()=>{
  const party=[c('a','balanced'),c('b','balanced')],e=engine(party),boss={id:'b',name:'Boss',boss:true,atk:5000};
  const hits=withRandom(.1,()=>bossCompanionCollateral(e,boss,{kind:'attack',damage:123}));
  assert.equal(hits.length,1);assert.equal(party.filter(x=>x.hp<x.maxHp).length,1);
});
