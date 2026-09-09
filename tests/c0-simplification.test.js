import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SD_BUILD_TAGS,
  SD_MASTER_SYNERGIES,
  SD_UNIQUE_IDENTITIES,
  equippedSdUniqueIdentities,
  activeSdMasterSynergies,
  isBreakWindow,
  classifyEnemyIntent,
} from '../js/data/systemDeepeningPackA.js';

const patchSource=readFileSync(new URL('../js/patches/systemDeepeningPackA.js',import.meta.url),'utf8');
const dataSource=readFileSync(new URL('../js/data/systemDeepeningPackA.js',import.meta.url),'utf8');

test('C0 retires BREAK GUARD ANALYSIS as universal runtime taxonomy',()=>{
  assert.deepEqual(Object.keys(SD_BUILD_TAGS),[]);
  assert.deepEqual(Object.keys(SD_MASTER_SYNERGIES),[]);
  assert.deepEqual(activeSdMasterSynergies({mastered:true,routeId:'sword_blademaster'}),[]);
  assert.equal(isBreakWindow({breakMax:100,breakGauge:0}),false);
  assert.doesNotMatch(patchSource,/BUILD BREAK|BUILD GUARD|BUILD ANALYSIS/);
  assert.doesNotMatch(patchSource,/activeSdMasterSynergies|isBreakWindow|SD_MASTER_SYNERGIES/);
  assert.doesNotMatch(dataSource,/breakGauge|breakMax/);
});

test('C0 preserves the three owned Unique IDs as concrete effects',()=>{
  assert.equal(SD_UNIQUE_IDENTITIES.uq_dragonbone_edge.kind,'execute');
  assert.equal(SD_UNIQUE_IDENTITIES.uq_nameless_crown.kind,'guardCounter');
  assert.equal(SD_UNIQUE_IDENTITIES.uq_inverted_codex.kind,'codexKnown');
  const equipped=equippedSdUniqueIdentities({weapon:'uq_dragonbone_edge#7',accessory1:'uq_inverted_codex'},id=>id.split('#')[0]);
  assert.deepEqual(equipped.map(x=>x.itemId),['uq_dragonbone_edge','uq_inverted_codex']);
  assert.match(SD_UNIQUE_IDENTITIES.uq_inverted_codex.summary,/図鑑/);
});

test('C0 keeps enemy intent but exposes Japanese player-facing labels',()=>{
  assert.equal(classifyEnemyIntent({dead:true}),null);
  assert.deepEqual(classifyEnemyIntent({pendingSpecial:true}),{
    kind:'DANGER',label:'危険',text:'大技の予兆。防御や対策を考えたい。',danger:true,
  });
  const guard=classifyEnemyIntent({combat3WillUseSkill:true,combat3Skill:{kind:'guardAll',name:'守勢'}});
  assert.equal(guard.kind,'GUARD');
  assert.equal(guard.label,'防御');
  assert.match(patchSource,/intent\.label/);
  assert.doesNotMatch(patchSource,/`\$\{intent\.kind\} —/);
});

test('C0 removes the equipment MutationObserver decoration owned by Pack A',()=>{
  assert.doesNotMatch(patchSource,/MutationObserver/);
  assert.doesNotMatch(patchSource,/sd-build-line/);
  assert.doesNotMatch(patchSource,/equipPicker/);
});
