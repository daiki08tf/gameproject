import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  COMPANION_RARE_TRAITS,rollCompanionRareTrait,rollCompanionEpithet,
  codexKnowledgeLevel,rareEncounterLines,
} from '../js/data/systemDeepeningPackB.js';

test('SD-3 rare companion traits are modest and optional',()=>{
  assert.equal(rollCompanionRareTrait(()=>.99),null);
  for(const trait of Object.values(COMPANION_RARE_TRAITS)){
    for(const mult of Object.values(trait.statMult||{})) assert.ok(mult<=1.08,'rare trait stat bonus must stay modest');
    if(trait.expMult) assert.ok(trait.expMult<=1.10);
  }
  assert.equal(rollCompanionEpithet(()=>.99),null);
});

test('SD-5 codex derives the five knowledge stages from existing records',()=>{
  assert.equal(codexKnowledgeLevel({}).id,'unseen');
  assert.equal(codexKnowledgeLevel({seen:true}).id,'seen');
  assert.equal(codexKnowledgeLevel({seen:true,kills:1}).id,'observed');
  assert.equal(codexKnowledgeLevel({seen:true,kills:5}).id,'studied');
  assert.equal(codexKnowledgeLevel({seen:true,kills:10}).id,'known');
  assert.equal(codexKnowledgeLevel({seen:true,kills:50}).id,'mastered');
});

test('SD-11 rare encounter first sighting is richer and repeat is compact',()=>{
  const first=rareEncounterLines({name:'白虹ユニコーン',first:true,ecology:'forest'});
  const repeat=rareEncounterLines({name:'白虹ユニコーン',first:false,ecology:'forest'});
  assert.ok(first.length>=3);
  assert.equal(repeat.length,1);
  assert.match(first.at(-1),/RARE ENCOUNTER/);
});

test('Pack B is wired through existing home bootstrap and bounded battle log',()=>{
  const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  const runtime=fs.readFileSync(new URL('../js/patches/systemDeepeningPackB.js',import.meta.url),'utf8');
  assert.match(home,/systemDeepeningPackA\.js/,'Pack A runtime must be live');
  assert.match(home,/systemDeepeningPackB\.js/,'Pack B runtime must be live');
  assert.match(runtime,/TextBattleScreen\.prototype\._revealNextGroupIfNeeded/);
  assert.match(runtime,/this\._pushLines\(rareEncounterLines/);
  assert.doesNotMatch(runtime,/appendChild\([^)]*textBattleScreen/);
});

test('Pack B uses old-save null defaults instead of rerolling old companions',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/systemDeepeningPackB.js',import.meta.url),'utf8');
  assert.match(runtime,/inst\.rareTrait\?\?=null/);
  assert.match(runtime,/inst\.epithet\?\?=null/);
  assert.doesNotMatch(runtime,/ensureIndividuality\([^)]*\).*rollCompanionRareTrait/s);
});
