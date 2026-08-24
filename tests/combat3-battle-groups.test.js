import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBattleGroups, battleGroupEnemyCount, BATTLE_GROUP_MAX_ENEMIES } from '../js/data/battleGroups.js';
import { findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { readFile } from 'node:fs/promises';

function waveCount(stage){return (stage.waves||[]).reduce((n,w)=>n+(Number(w.count)||0),0);}
function groupSize(g){return g.enemies.reduce((n,e)=>n+e.count,0);}

test('legacy stage waves become DQ-style mixed teams without losing enemies',()=>{
  const stage=findStage('1-4').stage;
  const groups=buildBattleGroups(stage);
  assert.equal(battleGroupEnemyCount(groups),waveCount(stage));
  assert.ok(groups.length>=3);
  assert.ok(groups.every(g=>groupSize(g)<=BATTLE_GROUP_MAX_ENEMIES));
  const mixed=groups.some(g=>g.enemies.length>=2);
  assert.ok(mixed,'at least one team should contain multiple enemy species');
});

test('boss stages end in an isolated BOSS group while keeping three lead teams when possible',()=>{
  const stage=findStage('1-5').stage;
  const groups=buildBattleGroups(stage);
  assert.equal(battleGroupEnemyCount(groups),waveCount(stage));
  assert.equal(groups.at(-1).bossWave,true);
  assert.equal(groups.at(-1).label,'BOSS');
  assert.ok(groups.at(-1).enemies.every(e=>ENEMY_TYPES[e.type]?.boss));
  assert.equal(groups.filter(g=>!g.bossWave).length,3);
});

test('large endgame stages create more teams instead of exceeding five visible enemies',()=>{
  const stage=findStage('abyss-1000').stage;
  const groups=buildBattleGroups(stage);
  assert.equal(battleGroupEnemyCount(groups),waveCount(stage));
  assert.ok(groups.length>3);
  assert.ok(groups.every(g=>groupSize(g)<=BATTLE_GROUP_MAX_ENEMIES));
});

test('explicit battleGroups support boss plus adds and bypass legacy auto composition',()=>{
  const stage={battleGroups:[
    {id:'team-1',label:'TEAM 1',enemies:[{type:'grunt',count:2},{type:'fast',count:1}]},
    {id:'boss',label:'BOSS',bossWave:true,enemies:[{type:'boss_orcking',count:1},{type:'grunt',count:2}]},
  ],waves:[{type:'grunt',count:99}]};
  const groups=buildBattleGroups(stage);
  assert.equal(groups.length,2);
  assert.equal(battleGroupEnemyCount(groups),6);
  assert.equal(groups[1].bossWave,true);
  assert.equal(groups[1].enemies.length,2);
});

test('Combat 3.0 bridge loads before TextBattleScreen is constructed',async()=>{
  const main=await readFile(new URL('../js/main.js',import.meta.url),'utf8');
  const bridge=main.indexOf("./patches/combat3BattleGroups.js");
  const screen=main.indexOf("./screens/textBattle.js");
  assert.ok(bridge>=0&&screen>=0&&bridge<screen);
});
