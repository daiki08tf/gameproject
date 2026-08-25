import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('endgame chase does not define a new equipment rarity',()=>{
  const src=fs.readFileSync(new URL('../js/data/loot3EndgameChase.js',import.meta.url),'utf8');
  assert.doesNotMatch(src,/rarity\s*:\s*['"](?:god|apex|ancient)['"]/i);
  assert.match(src,/NOT equipment rarities/);
});
