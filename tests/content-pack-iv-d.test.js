import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP4_FIRST_BRANCH_ANCHOR,cp4FirstBranchAnchorProgress } from '../js/data/contentPackIVD.js';

test('CP4-4 reveals only after Branch Sight plus survival evidence',()=>{const a=CP4_FIRST_BRANCH_ANCHOR;assert.equal(cp4FirstBranchAnchorProgress({discoveries:{}}).visible,false);assert.equal(cp4FirstBranchAnchorProgress({discoveries:{[a.branchSightDiscoveryId]:{}}}).visible,false);const d={[a.branchSightDiscoveryId]:{},[a.sourceEvidenceDiscoveryId]:{}};assert.deepEqual(cp4FirstBranchAnchorProgress({discoveries:d}),{state:'recognizable',visible:true,observed:false});d[a.discoveryId]={};assert.equal(cp4FirstBranchAnchorProgress({discoveries:d}).observed,true);});

test('CP4-4 names only 王樹領 and keeps absent-forest branch hidden',()=>{const text=JSON.stringify(CP4_FIRST_BRANCH_ANCHOR);assert.match(text,/観測分岐：王樹領/);assert.doesNotMatch(text,/深緑消失域|Transcendent|日本|東京|Earth/i);});

test('CP4-4 is observation-only in existing Chapter 2 Region UI',()=>{const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVD.js',import.meta.url),'utf8');assert.match(runtime,/state\.data\.world2/);assert.match(runtime,/traversable:false/);assert.match(runtime,/totalBranchCountHidden:true/);assert.match(runtime,/stageList/);assert.match(runtime,/第2章/);assert.match(runtime,/重なりを観測/);assert.doesNotMatch(runtime,/onPick\(|buildSecretRealmStage|teleport|portal|branchTravel|goContentPackIV|contentPackIVScreen/i);});

test('CP4-4 introduces no progression or RNG gate',()=>{const text=fs.readFileSync(new URL('../js/data/contentPackIVD.js',import.meta.url),'utf8')+fs.readFileSync(new URL('../js/patches/contentPackIVD.js',import.meta.url),'utf8');assert.doesNotMatch(text,/Math\.random|World Tier|worldTier|gearScore|difficulty|currency|token|Branch XP|stamina|daily|weekly|\b(?:reward|gold|exp|damage|attack|defense)\b/i);});
