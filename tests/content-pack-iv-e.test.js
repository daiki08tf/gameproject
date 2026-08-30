import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP4_HORIZONTAL_REACTIONS,cp4HorizontalReactionState } from '../js/data/contentPackIVE.js';

test('CP4-5 remains hidden until the first authored Branch anchor is observed',()=>{
  const def=CP4_HORIZONTAL_REACTIONS;
  assert.equal(def.prerequisiteDiscoveryId,'cp4:branch-anchor:tree-sovereign');
  assert.equal(cp4HorizontalReactionState({discoveries:{}}).active,false);
  assert.equal(cp4HorizontalReactionState({discoveries:{[def.prerequisiteDiscoveryId]:{}}}).active,true);
});

test('CP4-5 defines authored reactions for Rumor, Codex, Chronicle and Research only',()=>{
  const def=CP4_HORIZONTAL_REACTIONS;
  assert.equal(def.rumorId,'rumor:cp4:deep-green-record-conflict');
  assert.match(def.rumor.hint,/誤記ではなかった|別の固定された履歴/);
  assert.equal(def.codex.title,'深緑の森 — 歴史的不整合');
  assert.equal(def.chronicle.length,2);
  assert.equal(def.chronicle[0].sourceDiscoveryId,'cp4:parallax:first-contact');
  assert.equal(def.chronicle[1].sourceDiscoveryId,'cp4:branch-anchor:tree-sovereign');
  assert.equal(def.research.id,'cp4-tree-sovereign-ecology-comparison');
  assert.match(def.research.text,/Prime生態|樹冠集落|確認済み/);
});

test('CP4-5 runtime derives reactions from existing authorities without a new progression root',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVE.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.data\.world2\?\.discoveries/);
  assert.match(runtime,/state\.rumorNotebook/);
  assert.match(runtime,/state\.settlementChronicleTimeline/);
  assert.match(runtime,/state\.settlementResearchOutlook/);
  assert.match(runtime,/state\.cp4CodexHistoricalInconsistencies/);
  assert.doesNotMatch(runtime,/cp4ReactionProgress|branchCurrency|branchXp|branchLevel|stamina|Math\.random|worldTier|gearScore/i);
});

test('CP4-5 Codex presentation does not alter Codex completion authority',()=>{
  const ui=fs.readFileSync(new URL('../js/patches/codexUi.js',import.meta.url),'utf8');
  const foundation=fs.readFileSync(new URL('../js/patches/codexFoundation.js',import.meta.url),'utf8');
  assert.match(ui,/historicalInconsistencyRows/);
  assert.match(ui,/図鑑完成度・ポイントには加算しない/);
  assert.match(ui,/state\.cp4CodexHistoricalInconsistencies/);
  assert.doesNotMatch(ui,/CODEX_MILESTONES\.push|knownCodexEnemyIds\s*=|monsterCodex\s*=/);
  assert.doesNotMatch(foundation,/contentPackIVE|cp4CodexHistoricalInconsistencies/);
});

test('CP4-5 Chronicle and Research reactions are read-only derived rows',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVE.js',import.meta.url),'utf8');
  assert.match(runtime,/previous\(\)/);
  assert.match(runtime,/kind:'cp4-observation'/);
  assert.match(runtime,/settlementResearchUnlocked/);
  assert.match(runtime,/rows\.push\(\{\.\.\.reaction\}\)/);
  assert.doesNotMatch(runtime,/reviewSettlementResearchDomain|recordSettlementFactionActivity|ranchResearch|companionInstances/);
});

test('CP4-5 keeps hidden histories and future traversal out of the reaction copy',()=>{
  const data=fs.readFileSync(new URL('../js/data/contentPackIVE.js',import.meta.url),'utf8');
  assert.doesNotMatch(data,/深緑消失域|Transcendent|超観測者|日本|東京|Earth/i);
  assert.doesNotMatch(data,/teleport|portal|traversable|Branch XP|multiverse currency/i);
});

test('CP4-5 bootstraps from CP4-4 with a one-line child import',()=>{
  const parent=fs.readFileSync(new URL('../js/patches/contentPackIVD.js',import.meta.url),'utf8');
  assert.match(parent,/import '\.\/contentPackIVE\.js';/);
});
