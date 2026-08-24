import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COMBAT3_DIFFICULTY } from '../js/patches/combat3DifficultyRebalance.js';

test('Combat 3 text enemies receive meaningful survivability and damage pressure',()=>{
  assert.ok(COMBAT3_DIFFICULTY.normal.hp>=1.5);
  assert.ok(COMBAT3_DIFFICULTY.normal.atk>=1.2);
  assert.ok(COMBAT3_DIFFICULTY.normal.def>=1.1);
  assert.ok(COMBAT3_DIFFICULTY.boss.hp>COMBAT3_DIFFICULTY.normal.hp);
  assert.ok(COMBAT3_DIFFICULTY.boss.atk>COMBAT3_DIFFICULTY.normal.atk);
});

test('every Battle Group no longer grants a free unanswered player action',async()=>{
  const src=await readFile(new URL('../js/patches/combat3DifficultyRebalance.js',import.meta.url),'utf8');
  assert.match(src,/this\._freshGroupPending\s*=\s*false/);
});

test('difficulty retune is loaded by Combat 3 formation chain',async()=>{
  const src=await readFile(new URL('../js/patches/combat3Formation.js',import.meta.url),'utf8');
  assert.match(src,/combat3DifficultyRebalance\.js/);
});
