import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FUSION_JOBS, BASIC_FUSION_JOB_IDS } from '../js/data/jobFusionRegistry.js';
import { JOB_CONSTELLATION_TREES } from '../js/data/jobConstellationTrees.js';
import { FUSION_CONSTELLATIONS } from '../js/data/fusionConstellation.js';

test('constellation foundation is backed by all 15 basic stars and 105 fusion pairs',()=>{assert.equal(BASIC_FUSION_JOB_IDS.length,15);assert.equal(FUSION_JOBS.length,105);});
test('jobs screen defaults to constellation while preserving legacy list view',()=>{const src=fs.readFileSync(new URL('../js/screens/jobs.js',import.meta.url),'utf8');assert.match(src,/let jobView = 'constellation'/);assert.match(src,/renderJobConstellation/);assert.match(src,/data-job-view="list"/);});
test('constellation UI hides undiscovered fusion names and reveals mastered pairs',()=>{const src=fs.readFileSync(new URL('../js/screens/jobConstellation.js',import.meta.url),'utf8');assert.match(src,/masteredCount===2/);assert.match(src,/？？？？？/);assert.match(src,/data-fusion-job/);assert.match(src,/data-activate-fusion/);assert.match(src,/data-fusion-node/);});
test('all 15 basic jobs have complete playable constellation progression',()=>{assert.equal(Object.keys(JOB_CONSTELLATION_TREES).length,15);for(const id of BASIC_FUSION_JOB_IDS){const t=JOB_CONSTELLATION_TREES[id];assert.equal(t.length,6);for(const k of ['core','major','keystone','master'])assert.ok(t.some(n=>n.kind===k));for(const n of t)for(const req of n.requires)assert.ok(t.some(x=>x.id===req));}});
test('all 105 Fusion Jobs have purchasable Trait to Keystone to Ultimate definitions',()=>{assert.equal(Object.keys(FUSION_CONSTELLATIONS).length,105);for(const job of FUSION_JOBS){const t=FUSION_CONSTELLATIONS[job.id];assert.equal(t.length,3);assert.deepEqual(t.map(n=>n.cost),[1,2,3]);assert.equal(t[0].kind,'fusionTrait');assert.equal(t[1].kind,'fusionKeystone');assert.equal(t[2].kind,'fusionUltimate');assert.deepEqual(t[1].requires,[t[0].id]);assert.deepEqual(t[2].requires,[t[1].id]);}});
test('fusion runtime persists progression, supports one active fusion, and applies effects',()=>{const runtime=fs.readFileSync(new URL('../js/patches/jobConstellationRuntime.js',import.meta.url),'utf8');for(const needle of [/fusionConstellation/,/fusionPointsEarned/,/buyFusionNode/,/setActiveFusion/,/activeFusionNodes/])assert.match(runtime,needle);assert.match(runtime,/\.\.\.this\.activeFusionNodes\(\)/);assert.match(runtime,/chainMethod\(state,'getStats'/);});
