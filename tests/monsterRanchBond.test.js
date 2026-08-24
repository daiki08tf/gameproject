import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bondSkillsFor, setBondLevelResolver } from '../js/data/companionBondSkills.js';

test('Bond skills unlock at Lv4 and Lv8 per individual companion',()=>{
  const levels=new Map([['wolf#1',3],['wolf#2',4],['wolf#3',8]]);
  setBondLevelResolver(id=>levels.get(id)||1);
  assert.equal(bondSkillsFor({id:'wolf#1',atk:100,mag:20}).length,0);
  assert.deepEqual(bondSkillsFor({id:'wolf#2',atk:100,mag:20}).map(x=>x.id),['bond_strike']);
  assert.deepEqual(bondSkillsFor({id:'wolf#3',atk:100,mag:20}).map(x=>x.id),['bond_strike','soul_fang']);
});

test('Bond skills choose magical variants for MAG-oriented monsters',()=>{
  setBondLevelResolver(()=>8);
  assert.deepEqual(bondSkillsFor({id:'spirit#1',atk:30,mag:100}).map(x=>x.id),['bond_arcana','soul_nova']);
});

test('Companion AI includes Bond skills and battle awards Bond only on clear callback',()=>{
  const skillSource=fs.readFileSync(new URL('../js/data/companionSkills.js',import.meta.url),'utf8');
  const bondSource=fs.readFileSync(new URL('../js/patches/companionBond.js',import.meta.url),'utf8');
  assert.match(skillSource,/bondSkillsFor\(companion\)/);
  assert.match(bondSource,/result\?\.cleared/);
  assert.match(bondSource,/awardCompanionBattleBond/);
  assert.doesNotMatch(bondSource,/_grantKillRewards/);
  assert.doesNotMatch(bondSource,/_finishBattle/);
});

test('Monster Ranch core loads Bond and UI exposes Bond progression',()=>{
  const core=fs.readFileSync(new URL('../js/patches/monsterRanchCore.js',import.meta.url),'utf8');
  const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  const ui=fs.readFileSync(new URL('../js/patches/companionBondUi.js',import.meta.url),'utf8');
  assert.match(core,/companionBond\.js/);
  assert.match(home,/companionBondUi\.js/);
  assert.match(ui,/Bond Lv\./);
  assert.match(ui,/同行/);
});
