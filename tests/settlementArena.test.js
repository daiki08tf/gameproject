import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=fs.readFileSync(new URL('../js/data/settlementArena.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../js/patches/settlementArena.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../js/patches/settlementArenaUi.js',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');

test('S16 defines replay, gauntlet and restriction training modes',()=>{
 for(const id of ['spar','bossReplay','apexReplay','gauntlet'])assert.match(data,new RegExp(`id:'${id}'`));
 assert.match(data,/id:'noFlee'/);
 assert.match(data,/soloCheck/);
});

test('arena reuses canonical stages and BattleEngine instead of cloning combat rules',()=>{
 assert.match(runtime,/import \{ BattleEngine \} from '\.\.\/battleEngine\.js'/);
 assert.match(runtime,/import \{ CHAPTERS \} from '\.\.\/data\/stages\.js'/);
 assert.match(runtime,/sourceStageIds/);
 assert.doesNotMatch(runtime,/calculateDamage\s*=|class\s+ArenaBattle|new\s+BattleEngine/);
});

test('training suppresses progression rewards and keeps best-turn records only',()=>{
 assert.match(runtime,/if\(this\.stage\?\.arenaTraining\)/);
 assert.match(runtime,/xp:0,gold:0/);
 assert.match(runtime,/drops:\[\],manastone:0/);
 assert.match(runtime,/root\.arena\|\|\(root\.arena=\{best:\{\},runs:0\}\)/);
 assert.match(main,/result\.rune2Drops=!arena/);
 assert.match(main,/state\.data\.gold=arenaGoldSnapshot/);
 assert.match(main,/recordSettlementArenaResult/);
});

test('arena starts through the existing TextBattleScreen flow and stays inside Settlement UI',()=>{
 assert.match(ui,/settlement-arena-start/);
 assert.match(main,/window\.addEventListener\('settlement-arena-start'/);
 assert.match(main,/startBattle\(stage,null\)/);
 assert.match(nav,/settlementArena\.js/);
 assert.match(nav,/settlementArenaUi\.js/);
 assert.doesNotMatch(ui,/go[A-Za-z]+Btn/);
});
