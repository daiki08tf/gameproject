import test from 'node:test';
import assert from 'node:assert/strict';
import { allJobs } from '../js/data/jobs.js';
import { ALL_FUSION_JOBS } from '../js/data/jobFusion.js';
import {
  C1_JOB_IDENTITIES,
  C1_LEGACY_JOB_MIGRATION,
  c1MigrationAudit,
  c1MigrationTargetForLegacyJob,
} from '../js/data/jobIdentityMigration.js';

test('C1 keeps ten tactical identities, each with a concrete loop', () => {
  assert.equal(C1_JOB_IDENTITIES.length, 10);
  for (const job of C1_JOB_IDENTITIES) assert.ok(job.loop.length > 0, job.id);
});

test('every persisted legacy job id has one valid C1 migration destination', () => {
  const audit = c1MigrationAudit();
  assert.equal(audit.ok, true, JSON.stringify(audit));
  assert.equal(audit.legacyJobCount, 131);
  assert.equal(audit.fusionJobCount, 105);
  assert.equal(audit.mappedJobCount, 131);
  for (const job of allJobs()) assert.ok(c1MigrationTargetForLegacyJob(job.id), job.id);
});

test('all 105 fusion ids remain explicitly migratable before their UI is removed', () => {
  for (const fusion of ALL_FUSION_JOBS) {
    assert.ok(C1_LEGACY_JOB_MIGRATION[fusion.id], fusion.id);
  }
});

test('basic and special save anchors migrate to their intended tactical loops', () => {
  assert.equal(c1MigrationTargetForLegacyJob('craftsman'), 'bastion');
  assert.equal(c1MigrationTargetForLegacyJob('scholar'), 'elementalist');
  assert.equal(c1MigrationTargetForLegacyJob('battlemaster'), 'vanguard');
  assert.equal(c1MigrationTargetForLegacyJob('greatsage'), 'elementalist');
  assert.equal(c1MigrationTargetForLegacyJob('hero'), 'vanguard');
});
