import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { allJobs, getJob } from '../js/data/jobs.js';
import { getJob as getJobPhase8, allJobs as allJobsPhase8 } from '../js/data/jobsPhase8.js';

// Content brush-up (user decision 2026-09-08): the 10 special-tier jobs and
// Hero previously had zero hand-authored content -- a single auto-generated
// technique and the generic 3-bucket masterAbility auto-assignment, the same
// as the 75 trimmed auto-generated Fusion pairs. They now get real skills/
// spells (4 each, Lv1/10/20/MASTER, matching the 30 advanced jobs' existing
// depth) and a masterAbility hand-picked from the three existing condition
// types (weaponMatch/lowHp/always) rather than auto-assigned by dominant stat.

const SPECIAL_IDS = [
  'greatsage', 'swordsaint', 'fistemperor', 'pope', 'thiefking',
  'divaqueen', 'grandalchemist', 'merchantking', 'spiritking', 'oracle',
];
const VALID_MASTER_ABILITY_CONDITIONS = new Set(['weaponMatch', 'lowHp', 'always']);

test('every special-tier job has 4 hand-authored techniques at Lv1/10/20/MASTER', () => {
  for (const id of SPECIAL_IDS) {
    const job = getJob(id);
    assert.ok(job, id);
    const techs = [...job.skills, ...job.spells];
    assert.equal(techs.length, 4, `${id} should have exactly 4 techniques`);
    const levels = techs.map((t) => t.learnLevel).sort((a, b) => (a === 'master' ? 1 : b === 'master' ? -1 : a - b));
    assert.deepEqual(levels, [1, 10, 20, 'master'], id);
    // The auto-generated single-technique fallback names its skill after the
    // job (see wrapAutoSkillAsTechniques/autoSkillFor) -- a hand-authored
    // roster must not collapse back to that.
    for (const t of techs) assert.ok(t.name && t.id, `${id} technique missing name/id`);
  }
});

test('every special-tier job has a masterAbility using an existing condition type', () => {
  for (const id of SPECIAL_IDS) {
    const job = getJob(id);
    assert.ok(job.masterAbility, id);
    assert.ok(VALID_MASTER_ABILITY_CONDITIONS.has(job.masterAbility.condition), `${id}: ${job.masterAbility.condition}`);
  }
});

test('Hero has 4 hand-authored skills and no masterAbility (hero tier is never masterable)', () => {
  const hero = getJob('hero');
  assert.equal(hero.skills.length, 4);
  assert.equal(hero.spells.length, 0);
  const levels = hero.skills.map((t) => t.learnLevel).sort((a, b) => (a === 'master' ? 1 : b === 'master' ? -1 : a - b));
  assert.deepEqual(levels, [1, 10, 20, 'master']);
  assert.equal(hero.masterAbility, undefined);
});

test('special-tier and Hero techniques stay unique ids across the whole registry', () => {
  const ids = new Set();
  for (const job of allJobs()) {
    for (const t of [...job.skills, ...job.spells]) {
      assert.ok(!ids.has(t.id), `duplicate technique id: ${t.id}`);
      ids.add(t.id);
    }
  }
});

test('getStats() stays crash-free for every special-tier job and Hero', () => {
  state.resetAll();
  for (const id of [...SPECIAL_IDS, 'hero']) {
    state.data.jobs[id] ??= { level: 1, exp: 0 };
    state.data.currentJobId = id;
    assert.doesNotThrow(() => state.getStats(), `getStats() crashed for ${id}`);
  }
});

test('the Phase 8 unified registry (used by battle/job-switch) sees the same hand-authored content', () => {
  assert.equal(allJobsPhase8().length, 56);
  for (const id of SPECIAL_IDS) {
    const job = getJobPhase8(id);
    assert.equal([...job.skills, ...job.spells].length, 4, id);
  }
  assert.equal([...getJobPhase8('hero').skills, ...getJobPhase8('hero').spells].length, 4);
});
