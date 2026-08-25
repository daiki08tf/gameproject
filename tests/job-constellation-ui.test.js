import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FUSION_JOBS, BASIC_FUSION_JOB_IDS } from '../js/data/jobFusionRegistry.js';
import { JOB_CONSTELLATION_TREES } from '../js/data/jobConstellationTrees.js';

test('constellation foundation is backed by all 15 basic stars and 105 fusion pairs', () => {
  assert.equal(BASIC_FUSION_JOB_IDS.length, 15);
  assert.equal(FUSION_JOBS.length, 105);
});

test('jobs screen defaults to constellation while preserving legacy list view', () => {
  const src = fs.readFileSync(new URL('../js/screens/jobs.js', import.meta.url), 'utf8');
  assert.match(src, /let jobView = 'constellation'/);
  assert.match(src, /renderJobConstellation/);
  assert.match(src, /data-job-view="list"/);
  assert.match(src, /for \(const tier of \['basic', 'advanced', 'special', 'hero'\]\)/);
});

test('constellation UI hides undiscovered fusion names and reveals mastered pairs', () => {
  const src = fs.readFileSync(new URL('../js/screens/jobConstellation.js', import.meta.url), 'utf8');
  assert.match(src, /masteredCount === 2/);
  assert.match(src, /？？？？？/);
  assert.match(src, /f\.name/);
  assert.match(src, /共鳴 \$\{discovered\}\/105/);
});

test('all 15 basic jobs have complete playable constellation progression', () => {
  assert.equal(Object.keys(JOB_CONSTELLATION_TREES).length, 15);
  for (const id of BASIC_FUSION_JOB_IDS) {
    const tree = JOB_CONSTELLATION_TREES[id];
    assert.ok(tree, `missing constellation tree: ${id}`);
    assert.equal(tree.length, 6);
    assert.ok(tree.some(n => n.kind === 'core'));
    assert.ok(tree.some(n => n.kind === 'major'));
    assert.ok(tree.some(n => n.kind === 'keystone'));
    assert.ok(tree.some(n => n.kind === 'master'));
    assert.ok(tree.some(n => n.kind === 'keystone' && (n.statMult || n.statAdd || n.effects)));
    for (const node of tree) for (const req of node.requires) assert.ok(tree.some(n => n.id === req));
  }
});

test('constellation runtime persists SP purchases and applies through canonical stat/effect paths', () => {
  const runtime = fs.readFileSync(new URL('../js/patches/jobConstellationRuntime.js', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.match(runtime, /jobConstellation/);
  assert.match(runtime, /constellationPointsAvailable/);
  assert.match(runtime, /buyConstellationNode/);
  assert.match(runtime, /chainMethod\(state, 'getStats'/);
  assert.match(runtime, /state\.getEquippedEffects/);
  assert.match(main, /jobConstellationRuntime\.js/);
});
