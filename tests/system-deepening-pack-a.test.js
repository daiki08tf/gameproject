import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SD_UNIQUE_IDENTITIES,
  SD_MASTER_SYNERGIES,
  equippedSdUniqueIdentities,
  activeSdMasterSynergies,
  isBreakWindow,
  classifyEnemyIntent,
} from '../js/data/systemDeepeningPackA.js';

test('C0 compatibility: representative Unique identities retain concrete effects without build tags',()=>{
  assert.equal(SD_UNIQUE_IDENTITIES.uq_dragonbone_edge.kind,'execute');
  assert.ok(SD_UNIQUE_IDENTITIES.uq_dragonbone_edge.activeMult>1);
  assert.equal(SD_UNIQUE_IDENTITIES.uq_nameless_crown.kind,'guardCounter');
  assert.ok(SD_UNIQUE_IDENTITIES.uq_nameless_crown.counterMult>1);
  assert.equal(SD_UNIQUE_IDENTITIES.uq_inverted_codex.kind,'codexKnown');
  assert.ok(SD_UNIQUE_IDENTITIES.uq_inverted_codex.activeMult>1);
  assert.match(SD_UNIQUE_IDENTITIES.uq_inverted_codex.summary,/図鑑/);
});

test('C0 compatibility: equipped identity resolver preserves owned item ids and ignores ordinary gear',()=>{
  const out=equippedSdUniqueIdentities({weapon:'inst-dragon',head:'ordinary'},id=>id==='inst-dragon'?'uq_dragonbone_edge':id);
  assert.equal(out.length,1);
  assert.equal(out[0].itemId,'uq_dragonbone_edge');
  assert.equal(out[0].kind,'execute');
});

test('C0 compatibility: Job MASTER routes no longer add Pack A cross-tag bonuses',()=>{
  assert.deepEqual(activeSdMasterSynergies({mastered:false,routeId:'sword_blademaster'}),[]);
  assert.deepEqual(activeSdMasterSynergies({mastered:true,routeId:'sword_blademaster'}),[]);
  assert.deepEqual(SD_MASTER_SYNERGIES,{});
});

test('C0 compatibility: retired BREAK build helper never becomes a live damage condition',()=>{
  assert.equal(isBreakWindow({breakMax:100,breakGauge:0}),false);
  assert.equal(isBreakWindow({breakMax:100,breakGauge:1}),false);
  assert.equal(isBreakWindow({breakMax:0,breakGauge:0}),false);
});

test('SD-A: enemy intent classifies reserved tactical actions without exact damage spoilers',()=>{
  assert.equal(classifyEnemyIntent({dead:false,pendingSpecial:true}).kind,'DANGER');
  assert.equal(classifyEnemyIntent({dead:false,combat3WillUseSkill:false}).kind,'ATTACK');
  assert.equal(classifyEnemyIntent({dead:false,combat3WillUseSkill:true,combat3Skill:{kind:'guardAll',name:'守勢'}}).kind,'GUARD');
  assert.equal(classifyEnemyIntent({dead:false,combat3WillUseSkill:true,combat3Skill:{kind:'healAlly',name:'治療'}}).kind,'SUPPORT');
  assert.equal(classifyEnemyIntent({dead:false,combat3WillUseSkill:true,combat3Skill:{kind:'mpDrain',name:'吸魔'}}).kind,'DISRUPT');
  const cast=classifyEnemyIntent({dead:false,combat3WillUseSkill:true,combat3Skill:{kind:'burn',name:'炎上'}});
  assert.equal(cast.kind,'CAST');
  assert.doesNotMatch(cast.text,/\d+%|damage|ダメージ量/i);
});

test('C0 runtime reuses concrete Unique effects and keeps intent inside bounded enemy cards',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/systemDeepeningPackA.js',import.meta.url),'utf8');
  const enemyAI=fs.readFileSync(new URL('../js/patches/combat3EnemyAI.js',import.meta.url),'utf8');
  const mobile=fs.readFileSync(new URL('./phase14-mobile-command-regression.test.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.systemDeepeningBuildSummary/);
  assert.doesNotMatch(runtime,/job3SelectedRoute/);
  assert.doesNotMatch(runtime,/activeSdMasterSynergies|isBreakWindow/);
  assert.doesNotMatch(runtime,/BUILD BREAK|BUILD GUARD|BUILD ANALYSIS/);
  assert.match(runtime,/tb-intent-line/);
  assert.match(runtime,/enemyList.*querySelectorAll/s);
  assert.doesNotMatch(runtime,/appendChild\([^)]*commandGrid|insertAdjacentElement\([^)]*commandGrid/);
  assert.match(enemyAI,/combat3WillUseSkill/);
  assert.match(enemyAI,/planCombat3Skill/);
  assert.doesNotMatch(enemyAI,/if\(healReady&&Math\.random\(\)</);
  assert.match(mobile,/attack button stays outside enemy and log scrollers/i);
});
