import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path){return readFile(new URL(`../${path}`,import.meta.url),'utf8');}
function compact(text){return text.replace(/\s+/g,'');}

test('companion save migrates to three party slots while keeping slot-1 compatibility',async()=>{
  const text=await source('js/patches/companionFoundation.js');
  assert.match(text,/const PARTY_SIZE = 3/);assert.match(text,/companionParty: \[null, null, null\]/);assert.match(text,/state\.activeCompanionIds/);assert.match(text,/state\.activeCompanions/);assert.match(compact(text),/state\.activeCompanionId=functionactiveCompanionId\(\)\{returnthis\.data\.companionParty\[0\]/);assert.match(text,/state\.setCompanionSlot/);assert.match(text,/for \(let i = 1; i < PARTY_SIZE; i\+\+\)/,'release must clear every occupied party slot');
});

test('battle engine creates and runs all active companions',async()=>{
  const text=await source('js/patches/companionBattle.js'),c=compact(text);
  assert.match(c,/engine\.companions=party\.slice\(0,3\)/);
  assert.match(c,/engine\.companion=engine\.companions\[0\]/,'legacy single-companion alias should remain');
  assert.match(c,/for\(constcoflivingCompanions\(engine\)\)/);
  assert.match(text,/_companionsActedThisRound/);assert.match(c,/state\.gainPartyCompanionExp\(gained\)/);assert.match(c,/this\.engine\.companions\.map/,'HUD should render all party members');
});

test('enemy targeting only selects living companions',async()=>{
  const text=await source('js/patches/companionBattle.js'),c=compact(text);
  assert.match(c,/functionlivingCompanions\(engine\)/);assert.match(c,/constalive=livingCompanions\(engine\)/);assert.match(c,/c\.hp<=0\)c\.down=true/);
});
