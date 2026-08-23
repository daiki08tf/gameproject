import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('../js/patches/jobCodexUi.js',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');

test('job codex is loaded from main',()=>{
  assert.match(main,/jobCodexUi\.js/);
});

test('job codex exposes progression 3 growth and history',()=>{
  assert.match(src,/getGrowthPerCharacterLevel/);
  assert.match(src,/getGrowthHistory/);
  assert.match(src,/Character Lvアップ時の永久成長/);
  assert.match(src,/MDEF/);
});

test('job codex supports hidden future secret jobs',()=>{
  assert.match(src,/job\.secret/);
  assert.match(src,/？？？？？/);
  assert.match(src,/秘密職/);
  assert.match(src,/\/\?\?\?/);
});

test('job codex includes unlock, mastery, techniques and derivatives',()=>{
  assert.match(src,/unlockRequirementText/);
  assert.match(src,/MASTERボーナス/);
  assert.match(src,/習得する特技・呪文/);
  assert.match(src,/派生する職業/);
});
