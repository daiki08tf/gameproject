import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function src(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Legendary imprint safety rejects occupied Legendary slots', async () => {
  const safety = await src('js/patches/equipment3DebugSafety.js');
  assert.match(safety, /if \(inst\.legendaryEffectId\) return false;/);
  assert.match(safety, /previousImprintLegendary/);
});

test('Equipment 3.0 safety patch loads after blacksmith and abyss bridges', async () => {
  const main = await src('js/main.js');
  const blacksmith = main.indexOf("./patches/equipment3Blacksmith.js");
  const abyss = main.indexOf("./patches/equipment3AbyssEndgame.js");
  const safety = main.indexOf("./patches/equipment3DebugSafety.js");
  assert.ok(blacksmith >= 0 && abyss >= 0 && safety >= 0);
  assert.ok(safety > blacksmith);
  assert.ok(safety > abyss);
});

test('Loot Filter 3.0 receives instance ids instead of base-item-only data', async () => {
  const equipment = await src('js/screens/equipment.js');
  assert.match(equipment, /state\.passesLootFilter\(c\.id, getItem\(c\.id\)\)/);
});

test('Abyss E9 is anchored to chapter 15 and exposes IP roadmap metadata', async () => {
  const abyss = await src('js/data/abyss.js');
  assert.match(abyss, /CH15/);
  assert.match(abyss, /itemPowerTarget\s*:\s*itemPower/);
  assert.doesNotMatch(abyss, /hpMult\(10\)/);
  assert.doesNotMatch(abyss, /atkMult\(10\)/);
});
