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

test('SD-A: representative Unique identities create three lateral build axes',()=>{
  assert.equal(SD_UNIQUE_IDENTITIES.uq_dragonbone_edge.tag,'break');
  assert.ok(SD_UNIQUE_IDENTITIES.uq_dragonbone_edge.activeMult>1);
  assert.ok(SD_UNIQUE_IDENTITIES.uq_dragonbone_edge.neutralMult<1);
  assert.equal(SD_UNIQUE_IDENTITIES.uq_nameless_crown.tag,'guard');
  assert.ok(SD_UNIQUE_IDENTITIES.uq_nameless_crown.counterMult>1);
  assert.equal(SD_UNIQUE_IDENTITIES.uq_inverted_codex.tag,'analysis');
  assert.ok(SD_UNIQUE_IDENTITIES.uq_inverted_codex.activeMult>1);
  assert.ok(SD_UNIQUE_IDENTITIES.uq_inverted_codex.unknownMult<1);
});

test('SD-A: equipped identity resolver is additive and ignores ordinary gear',()=>{
  const out=equippedSdUniqueIdentities({weapon:'inst-dragon',head:'ordinary'},id=>id==='inst-dragon'?'uq_dragonbone_edge':id);
  assert.equal(out.length,1);
  assert.equal(out[0].itemId,'uq_dragonbone_edge');
  assert.equal(out[0].tag,'break');
});

test('SD-A: Job synergy requires the active route to actually be MASTERed',()=>{
  assert.deepEqual(activeSdMasterSynergies({mastered:false,routeId:'sword_blademaster'}),[]);
  const active=activeSdMasterSynergies({mastered:true,routeId:'sword_blademaster'});
  assert.equal(active.length,1);
  assert.equal(active[0].tag,'break');
  assert.ok(active[0].activeMult>1);
  assert.equal(SD_MASTER_SYNERGIES.sword_guardian.tag,'guard');
  assert.equal(SD_MASTER_SYNERGIES.staff_arcanist.tag,'analysis');
});

test('SD-A: Break window only activates on a real depleted Break gauge',()=>{
  assert.equal(isBreakWindow({breakMax:100,breakGauge:0}),true);
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

test('SD-A: runtime reuses existing systems and keeps intent inside bounded enemy cards',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/systemDeepeningPackA.js',import.meta.url),'utf8');
  const enemyAI=fs.readFileSync(new URL('../js/patches/combat3EnemyAI.js',import.meta.url),'utf8');
  const mobile=fs.readFileSync(new URL('./phase14-mobile-command-regression.test.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.systemDeepeningBuildSummary/);
  assert.match(runtime,/job3SelectedRoute/);
  assert.match(runtime,/tb-intent-line/);
  assert.match(runtime,/enemyList.*querySelectorAll/s);
  assert.doesNotMatch(runtime,/appendChild\([^)]*commandGrid|insertAdjacentElement\([^)]*commandGrid/);
  assert.match(enemyAI,/combat3WillUseSkill/);
  assert.match(enemyAI,/planCombat3Skill/);
  assert.doesNotMatch(enemyAI,/if\(healReady&&Math\.random\(\)</);
  assert.match(mobile,/attack button stays outside enemy and log scrollers/i);
});
