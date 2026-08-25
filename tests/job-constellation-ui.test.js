import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FUSION_JOBS, BASIC_FUSION_JOB_IDS } from '../js/data/jobFusionRegistry.js';

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
  assert.match(src, /fusion\.name/);
  assert.match(src, /共鳴 \$\{discoveredCount\}\/105/);
});
