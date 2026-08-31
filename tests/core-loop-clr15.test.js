import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const stageFirst=fs.readFileSync('js/patches/stageFirstNavigationUi.js','utf8');
const pilot=fs.readFileSync('js/data/adventureWorld4Pilot.js','utf8');
const session=fs.readFileSync('js/patches/adventureWorld4Session.js','utf8');

test('CLR-15 exposes Hunt only from a cleared ordinary Stage in a completed owning Region',()=>{
  assert.match(stageFirst,/!state\.isStageCleared\(stage\.id\)/);
  assert.match(stageFirst,/stage\.branch\|\|stage\.bounty/);
  assert.match(stageFirst,/progress\.status!==['"]completed['"]/);
  assert.match(stageFirst,/region\.chapterNumbers\.includes\(Number\(chapter\?\.num\)\)/);
});

test('CLR-15 launches or resumes the existing Adventure Session instead of creating Hunt progression',()=>{
  assert.match(stageFirst,/state\.startAdventure4\?\.\(\{regionId:context\.region\.id,returnTarget:['"]home['"]\}\)/);
  assert.match(stageFirst,/state\.resumeAdventure4\?\.\(\)/);
  assert.match(stageFirst,/renderAdventureRoute\(\)/);
  assert.doesNotMatch(stageFirst,/hunt(Level|Xp|XP|Currency|Token|Stamina|Energy)/);
});

test('CLR-15 reuses the existing free-adventure multi-battle route when Region Story is complete',()=>{
  assert.match(pilot,/const storyCleared=regionState\?\.status===['"]completed['"]&&!regionState\?\.routeEntry/);
  assert.match(pilot,/storyCleared\?buildFreeAdventureRoute\(region,options\):buildStoryRoute\(region,regionState\)/);
  // CLR-19 replaced the frontier/elemental-only CLR_COMBAT_FIRST_REGIONS
  // allowlist with clr19RegionUsesSharedHunt(), which every canonical World3
  // Region now satisfies (see coreLoopClr19.js / core-loop-clr19.test.js).
  assert.match(pilot,/clr19RegionUsesSharedHunt/);
  assert.match(pilot,/clr1-combat-first/);
  assert.match(pilot,/clr2-aftermath-branching/);
});

test('CLR-15 keeps the canonical Adventure Session save owner and one active run constraint',()=>{
  assert.match(session,/state\.data\.adventure4/);
  assert.match(session,/if\(current\.active\)return\{ok:false,reason:['"]active_session['"]/);
  assert.match(stageFirst,/existing\.regionId!==context\.region\.id/);
  assert.match(stageFirst,/reason:['"]other_active_session['"]/);
});

test('CLR-15 keeps Stage and Region context visible on the Stage confirmation surface',()=>{
  assert.match(stageFirst,/Hunt \/ \$\{available\.region\.name\}を周回/);
  assert.match(stageFirst,/Story踏破済みの「\$\{available\.region\.name\}」を連戦周回/);
  assert.match(stageFirst,/name\.textContent=`\$\{stage\.id\} \$\{stage\.name\}`/);
});
