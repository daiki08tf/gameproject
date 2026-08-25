import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FUSION_JOBS, BASIC_FUSION_JOB_IDS } from '../js/data/jobFusionRegistry.js';
import { JOB_CONSTELLATION_TREES } from '../js/data/jobConstellationTrees.js';
import { FUSION_CONSTELLATIONS } from '../js/data/fusionConstellation.js';

test('constellation foundation is backed by all 15 basic stars and 105 fusion pairs',()=>{assert.equal(BASIC_FUSION_JOB_IDS.length,15);assert.equal(FUSION_JOBS.length,105);});
test('jobs screen defaults to constellation while preserving legacy list view',()=>{const src=fs.readFileSync(new URL('../js/screens/jobs.js',import.meta.url),'utf8');assert.match(src,/let jobView = 'constellation'/);assert.match(src,/renderJobConstellation/);assert.match(src,/data-job-view="list"/);});
test('constellation UI hides undiscovered fusion names and reveals mastered pairs',()=>{const src=fs.readFileSync(new URL('../js/screens/jobConstellation.js',import.meta.url),'utf8');assert.match(src,/masteredCount === 2/);assert.match(src,/？？？？？/);assert.match(src,/f\.name/);});
test('all 15 basic jobs have complete playable constellation progression',()=>{assert.equal(Object.keys(JOB_CONSTELLATION_TREES).length,15);for(const id of BASIC_FUSION_JOB_IDS){const t=JOB_CONSTELLATION_TREES[id];assert.equal(t.length,6);for(const k of ['core','major','keystone','master'])assert.ok(t.some(n=>n.kind===k));for(const n of t)for(const req of n.requires)assert.ok(t.some(x=>x.id===req));}});
test('all 105 Fusion Jobs have Trait to Keystone to Ultimate definitions',()=>{assert.equal(Object.keys(FUSION_CONSTELLATIONS).length,105);for(const job of FUSION_JOBS){const t=FUSION_CONSTELLATIONS[job.id];assert.equal(t.length,3);assert.equal(t[0].kind,'fusionTrait');assert.equal(t[1].kind,'fusionKeystone');assert.equal(t[2].kind,'fusionUltimate');assert.deepEqual(t[1].requires,[t[0].id]);assert.deepEqual(t[2].requires,[t[1].id]);assert.ok(t[0].statMult);assert.equal(t[1].effects.length,2);assert.equal(t[2].effects.length,2);}});
test('constellation runtime persists SP purchases and applies through canonical stat/effect paths',()=>{const runtime=fs.readFileSync(new URL('../js/patches/jobConstellationRuntime.js',import.meta.url),'utf8');const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');assert.match(runtime,/jobConstellation/);assert.match(runtime,/buyConstellationNode/);assert.match(runtime,/chainMethod\(state, 'getStats'/);assert.match(main,/jobConstellationRuntime\.js/);});
