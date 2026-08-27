import test from 'node:test';
import assert from 'node:assert/strict';
import { getJob } from '../js/data/jobsPhase8.js';

test('generated Fusion jobs preserve both parent weapon affinities', () => {
  const magicHunter = getJob('fusion_mage_hunter');
  assert.equal(magicHunter.weapon, 'staff');
  assert.deepEqual(magicHunter.weapons, ['staff', 'bow']);

  const warriorHunter = getJob('fusion_warrior_hunter');
  assert.equal(warriorHunter.weapon, 'sword');
  assert.deepEqual(warriorHunter.weapons, ['sword', 'bow']);
});

test('same-family Fusion parents collapse duplicate affinities', () => {
  const phantomThief = getJob('phantomthief');
  assert.deepEqual(phantomThief.weapons, ['dagger']);
});

test('legacy primary weapon remains available for old callers', () => {
  for (const id of ['fusion_mage_hunter', 'fusion_warrior_hunter', 'phantomthief']) {
    const job = getJob(id);
    assert.equal(typeof job.weapon, 'string', id);
    assert.ok(job.weapons.includes(job.weapon), id);
  }
});
