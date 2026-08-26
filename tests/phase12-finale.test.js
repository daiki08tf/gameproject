import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PHASE12_REGION_DEPTH,PHASE12_CODEX_GROUPS,PHASE12_APEX,PHASE12_APEX_BOSS_PROFILE,phase12MasterySnapshot } from '../js/data/phase12Finale.js';
import { SECRET_REALM_EXPANSION } from '../js/data/secretRealmExpansion.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';

test('Phase 12.11 adds one optional horizontal depth goal to each outer-world region',()=>{
  assert.deepEqual(PHASE12_REGION_DEPTH.map(x=>x.chapter),[21,22,23,24,25]);
  assert.equal(new Set(PHASE12_REGION_DEPTH.map(x=>x.stageId)).size,5);
  const partial=phase12MasterySnapshot(id=>id!=='secret-black-moon-temple',{});
  assert.equal(partial.cleared,4);
  assert.equal(partial.complete,false);
  assert.equal(partial.apexReady,false);
  const complete=phase12MasterySnapshot(()=>true,{});
  assert.equal(complete.cleared,5);
  assert.equal(complete.complete,true);
});

test('Phase 12.11 preserves existing regional mastery and only attaches horizontal depth',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/phase12FinaleRuntime.js',import.meta.url),'utf8');
  assert.match(runtime,/previousRegionMastery/);
  assert.match(runtime,/\.\.\.base,horizontalDepth/);
  assert.doesNotMatch(runtime,/mastered\s*:/);
});

test('Phase 12.12 Codex groups separate common rare boss and apex ecology',()=>{
  assert.deepEqual(PHASE12_CODEX_GROUPS.map(x=>x.id),['horizontal_common','horizontal_rare','horizontal_boss','horizontal_apex']);
  assert.equal(PHASE12_CODEX_GROUPS.find(x=>x.id==='horizontal_rare').enemyIds.length,5);
  assert.equal(PHASE12_CODEX_GROUPS.find(x=>x.id==='horizontal_boss').enemyIds.length,5);
  assert.deepEqual(PHASE12_CODEX_GROUPS.find(x=>x.id==='horizontal_apex').enemyIds,['phase12_apex_guard','phase12_apex_wisp','phase12_apex_boss']);
});

test('Phase 12.13 registers a real apex Secret Realm at the Lv99999/IP10000 ceiling',()=>{
  assert.equal(SECRET_REALM_EXPANSION.convergence_observatory,PHASE12_APEX);
  const stage=buildSecretRealmStage('secret-convergence-observatory');
  assert.equal(stage.phase12Apex,true);
  assert.equal(stage.secretRealm,true);
  assert.equal(stage.recLevel,99999);
  assert.equal(stage.itemPowerTarget,10000);
  assert.ok(stage.waves.some(w=>w.type==='phase12_apex_boss'));
  assert.equal(PHASE12_APEX_BOSS_PROFILE.phases.length,4);
  assert.ok(PHASE12_APEX_BOSS_PROFILE.phases.filter(x=>Number.isFinite(x.breakGaugePct)).length>=3);
});

test('Apex unlock is gated by five horizontal clears rather than Abyss depth alone',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/phase12FinaleRuntime.js',import.meta.url),'utf8');
  assert.match(runtime,/convergence_observatory/);
  assert.match(runtime,/!mastery\.apexReady/);
  assert.match(runtime,/unlocked:false/);
});

test('Phase 12.14 stays inside existing Abyss and Codex UI surfaces',()=>{
  const abyss=fs.readFileSync(new URL('../js/screens/abyss.js',import.meta.url),'utf8');
  const runtime=fs.readFileSync(new URL('../js/patches/phase12FinaleRuntime.js',import.meta.url),'utf8');
  const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');
  assert.match(abyss,/横軸探索/);
  assert.match(abyss,/renderHorizontalMastery/);
  assert.match(abyss,/五異界主の記録が必要/);
  assert.match(runtime,/横軸生態記録/);
  assert.match(runtime,/goMonsterCodexBtn/);
  assert.match(main,/phase12FinaleRuntime\.js/);
  assert.doesNotMatch(main,/goPhase12|phase12Screen/);
});
