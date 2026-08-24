import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allJobs } from '../js/data/jobs.js';
import { JOB3_WEAPON_TREES, specializationRoutesForJob, activeSpecializationNodes } from '../js/data/job3Specializations.js';

test('all eight weapon families have two three-node specialization routes', () => {
  assert.equal(Object.keys(JOB3_WEAPON_TREES).length, 8);
  for (const routes of Object.values(JOB3_WEAPON_TREES)) {
    assert.equal(routes.length, 2);
    for (const route of routes) assert.equal(route.nodes.length, 3);
  }
});

test('every normal Job receives two routes from its preferred weapon', () => {
  for (const job of allJobs()) {
    const routes = specializationRoutesForJob(job);
    assert.equal(routes.length, 2, `${job.id} (${job.weapon})`);
  }
});

test('specialization nodes activate at Lv5, Lv10 and MASTER', () => {
  const job = allJobs().find((j) => j.weapon === 'sword');
  const route = specializationRoutesForJob(job)[0];
  assert.equal(activeSpecializationNodes(job, 4, false, route.id).length, 0);
  assert.equal(activeSpecializationNodes(job, 5, false, route.id).length, 1);
  assert.equal(activeSpecializationNodes(job, 10, false, route.id).length, 2);
  assert.equal(activeSpecializationNodes(job, 10, true, route.id).length, 3);
});

test('Job 3.0 core loads before the jobs screen is imported', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const core = main.indexOf("./patches/job3SpecializationCore.js");
  const screen = main.indexOf("./screens/jobs.js");
  assert.ok(core > 0 && screen > core);
});
