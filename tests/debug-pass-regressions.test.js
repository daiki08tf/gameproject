import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
async function src(path){return readFile(new URL(`../${path}`,import.meta.url),'utf8');}

test('Codex EXP bonus uses the Character EXP multiplier hook',async()=>{
  const progression=await src('js/patches/progressionCore.js');
  const codex=await src('js/patches/codexFoundation.js');
  assert.match(progression,/characterExpRewardMult/);
  assert.match(progression,/characterGained/);
  assert.match(codex,/characterExpRewardMult/);
  assert.doesNotMatch(codex,/gainCharacterExp/);
});

test('inheritance source is job independent',async()=>{
  const text=await src('js/patches/inheritanceCore.js');
  assert.match(text,/CHARACTER_LAYER/);
  assert.match(text,/characterIntrinsicAtLevel/);
  assert.doesNotMatch(text,/computeStats\(this\.currentJobId/);
});

test('Codex is applied before Rune and both are reported separately',async()=>{
  const text=await src('js/patches/rune2Core.js');
  assert.match(text,/applyRunes\(applyCodex\(inheritanceGetStats\(\),this\),this\)/);
  assert.match(text,/const codex=/);
  assert.match(text,/const rune=/);
  assert.match(text,/const lowerStats=inheritanceGetStats\(\)/);
});

test('full reset restores a valid three-slot companion party',async()=>{
  const main=await src('js/main.js');
  const safety=await src('js/patches/companionResetSafety.js');
  assert.match(main,/companionResetSafety\.js/);
  assert.match(safety,/companionParty = \[null, null, null\]/);
  assert.match(safety,/createCompanion\?\.\('slime'/);
});
