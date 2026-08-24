import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function src(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('regular stage weapon drops preserve Equipment 3.0 instance ids in results', async () => {
  const text = await src('js/patches/weaponAffixResultVisibility.js');
  assert.match(text, /wrapDropMethod\('_rollDrop'\)/);
  assert.match(text, /info\.instanceId/);
});

test('Abyss dynamic drops cannot resurrect retired equipment Runes', async () => {
  const text = await src('js/data/abyss.js');
  const tableStart = text.indexOf('function ch15DropTable()');
  const tableEnd = text.indexOf('export function buildAbyssStage', tableStart);
  const table = text.slice(tableStart, tableEnd);
  assert.doesNotMatch(table, /rune_effect_/);
});

test('Abyss venom modifier has a real text-battle downside', async () => {
  const text = await src('js/data/abyss.js');
  assert.match(text, /id: 'mod_venom'[\s\S]*healMult: 0\.7/);
  // Historical comments may mention the retired field name; the executable
  // property itself must not remain in the stage/modifier data.
  assert.doesNotMatch(text, /contactDmgMult\s*:/);
});

test('auto equip applies canEquipItem to accessories too', async () => {
  const text = await src('js/patches/weaponInstanceFoundation.js');
  assert.match(text, /const accessory1 = takeBest\('accessory'\)/);
  assert.match(text, /const accessory2 = takeBest\('accessory'\)/);
  assert.match(text, /if \(!this\.canEquipItem\(item\)\) continue/);
  assert.doesNotMatch(text, /accCandidates\.sort/);
});

test('enhancement never consumes the last bag copy of its own target', async () => {
  const text = await src('js/patches/weaponInstanceFoundation.js');
  assert.match(text, /targetEquipped/);
  assert.match(text, /const reserve = id === targetId && !targetEquipped \? 1 : 0/);
});

test('Equipment 3.0 load repair preserves special naming and instance sequence', async () => {
  const text = await src('js/patches/equipment3Foundation.js');
  assert.match(text, /canonicalDisplayName/);
  assert.match(text, /getLegendaryEffect/);
  assert.match(text, /getCursedAffix/);
  assert.match(text, /actualGreaterCount/);
  assert.match(text, /repairNextInstanceSeq/);
  assert.match(text, /maxSeq \+ 1/);
});

test('battle result accounting follows Character EXP rather than legacy Job gained field', async () => {
  const patch = await src('js/patches/battleRewardAccountingFix.js');
  const main = await src('js/main.js');
  assert.match(patch, /characterGained/);
  assert.match(patch, /debugCharacterKillAccounting/);
  assert.match(patch, /debugStageRewardAccounting/);
  assert.match(patch, /goldGained/);
  assert.match(main, /battleRewardAccountingFix\.js/);
});

test('diagnostic: base Affix quality still uses depth rather than E9 Item Power target', async () => {
  const affixes = await src('js/data/affixes.js');
  // Intentional diagnostic guard, not a balance change: this documents the remaining
  // E9 integration gap so a later design pass can change it deliberately.
  assert.match(affixes, /depthBonus = Math\.min\(0\.5, \(ctx\.depth \|\| 0\) \/ 400\)/);
  assert.doesNotMatch(affixes, /ctx\.itemPowerTarget/);
});
