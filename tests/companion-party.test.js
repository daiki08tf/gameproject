import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), 'utf8'); }

test('companion save migrates to three party slots while keeping slot-1 compatibility', async () => {
  const text = await source('js/patches/companionFoundation.js');
  assert.match(text, /const PARTY_SIZE = 3/);
  assert.match(text, /companionParty: \[null, null, null\]/);
  assert.match(text, /state\.activeCompanionIds/);
  assert.match(text, /state\.activeCompanions/);
  assert.match(text, /state\.activeCompanionId=function activeCompanionId\(\)\{return this\.data\.companionParty\[0\]/);
  assert.match(text, /state\.setCompanionSlot/);
  assert.match(text, /for \(let i = 1; i < PARTY_SIZE; i\+\+\)/, 'release must clear every occupied party slot');
});

test('battle engine creates and runs all active companions', async () => {
  const text = await source('js/patches/companionBattle.js');
  assert.match(text, /engine\.companions = party\.slice\(0, 3\)/);
  assert.match(text, /engine\.companion = engine\.companions\[0\]/, 'legacy single-companion alias should remain');
  assert.match(text, /for\(const c of livingCompanions\(engine\)\)/);
  assert.match(text, /_companionsActedThisRound/);
  assert.match(text, /state\.gainPartyCompanionExp\(gained\)/);
  assert.match(text, /this\.engine\.companions\.map/, 'HUD should render all party members');
});

test('enemy targeting only selects living companions', async () => {
  const text = await source('js/patches/companionBattle.js');
  assert.match(text, /function livingCompanions\(engine\)/);
  assert.match(text, /const alive=livingCompanions\(engine\)/);
  assert.match(text, /c\.hp<=0\)c\.down=true/);
});
