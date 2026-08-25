import test from 'node:test';
import assert from 'node:assert/strict';
import { allJobs } from '../js/data/jobs.js';
import {
  BASIC_FUSION_JOB_IDS,
  FUSION_JOBS,
  fusionPairKey,
  getFusionJobByParents,
  getFusionJobById,
  unlockedFusionJobs,
} from '../js/data/jobFusionRegistry.js';

test('Phase 8 registry contains exactly all 15C2 = 105 unordered pairs', () => {
  assert.equal(BASIC_FUSION_JOB_IDS.length, 15);
  assert.equal(FUSION_JOBS.length, 105);
  const pairKeys = FUSION_JOBS.map((job) => fusionPairKey(...job.parents));
  assert.equal(new Set(pairKeys).size, 105);
  const ids = FUSION_JOBS.map((job) => job.id);
  assert.equal(new Set(ids).size, 105);
  const names = FUSION_JOBS.map((job) => job.name);
  assert.equal(new Set(names).size, 105);
});

test('every Fusion parent is a valid basic job and no job fuses with itself', () => {
  const basic = new Set(BASIC_FUSION_JOB_IDS);
  for (const job of FUSION_JOBS) {
    assert.equal(job.parents.length, 2);
    assert.ok(basic.has(job.parents[0]));
    assert.ok(basic.has(job.parents[1]));
    assert.notEqual(job.parents[0], job.parents[1]);
  }
});

test('all 30 legacy advanced IDs remain owned by their existing parent pairs', () => {
  const existingAdvanced = new Map(allJobs().filter((job) => job.tier === 'advanced').map((job) => [job.id, job]));
  const legacy = FUSION_JOBS.filter((job) => job.legacy);
  assert.equal(legacy.length, 30);
  for (const fusion of legacy) {
    const current = existingAdvanced.get(fusion.id);
    assert.ok(current, `missing legacy advanced job ${fusion.id}`);
    assert.equal(fusionPairKey(...current.requires), fusionPairKey(...fusion.parents), `parent pair changed for ${fusion.id}`);
  }
});

test('75 missing pairs receive stable fusion_* IDs', () => {
  const fresh = FUSION_JOBS.filter((job) => !job.legacy);
  assert.equal(fresh.length, 75);
  assert.ok(fresh.every((job) => job.id.startsWith('fusion_')));
});

test('pair lookup is order-independent and preserves approved collision resolutions', () => {
  assert.equal(getFusionJobByParents('mage', 'warrior')?.id, 'spellblade');
  assert.equal(getFusionJobByParents('priest', 'dancer')?.name, '神楽巫女');
  assert.equal(getFusionJobByParents('priest', 'fortune')?.id, 'miko');
  assert.equal(getFusionJobByParents('thief', 'merchant')?.id, 'treasurehunter');
  assert.equal(getFusionJobByParents('thief', 'scholar')?.name, '遺物探究家');
  assert.equal(getFusionJobById('battlemaster')?.name, '羅刹');
});

test('unlock helper exposes only pairs whose two basic jobs are MASTERed', () => {
  const unlocked = unlockedFusionJobs(new Set(['warrior', 'mage', 'priest']));
  assert.equal(unlocked.length, 3);
  assert.deepEqual(new Set(unlocked.map((job) => job.name)), new Set(['魔法剣士', 'パラディン', '賢者']));
});
