import test from 'node:test';
import assert from 'node:assert/strict';

import { state } from '../js/state.js';
// Loads the progression3Core.js patch chain (chainMethod'd onto state.getStats())
// so this test exercises the exact reachable path battle entry/status use.
import '../js/patches/progression3Core.js';
import { migrateC1JobSaveBack } from '../js/data/jobIdentityMigration.js';
import { allJobs } from '../js/data/jobsPhase8.js';

// Regression for: progression3Core.js imported computeStats()/getJob() straight
// from the legacy data/jobs.js registry, which at the time had no entries for
// c1_* job ids (the default currentJobId while the C1 flat 10-job roster was
// briefly the active one). That made getStats() throw "Cannot read properties
// of undefined (reading 'tier')" for any c1_* current job -- i.e. on every
// fresh save at the time -- breaking battle entry, the status screen, and
// anything else stat-dependent. The C1 roster has since been retired back to
// the tiered/fusion roster (see jobsPhase8.js), so the default is a legacy
// job again -- but computeStats()/getJob() must still come from the Phase 8
// wrapper rather than the raw legacy registry, or this class of crash returns
// for anything that isn't in data/jobs.js (the 75 auto-generated Fusion pairs,
// and any lingering c1_* id from an old save).
test('getStats() does not crash for the default (legacy) current job', () => {
  state.resetAll();
  assert.equal(state.data.currentJobId, 'warrior');
  assert.doesNotThrow(() => state.getStats());
  const stats = state.getStats();
  for (const key of ['hp', 'mp', 'atk', 'def', 'mag', 'spd']) {
    assert.ok(Number.isFinite(stats[key]), `${key} must be a finite number, got ${stats[key]}`);
    assert.ok(stats[key] > 0, `${key} must be positive`);
  }
});

test('getStats() stays crash-free across the entire restored tiered/fusion roster', () => {
  state.resetAll();
  for (const job of allJobs()) {
    state.data.jobs[job.id] ??= { level: 1, exp: 0 };
    state.data.currentJobId = job.id;
    assert.doesNotThrow(() => state.getStats(), `getStats() crashed for ${job.id}`);
  }
});

// The C1 identities themselves are retired from the active/selectable roster.
// A save carrying one is folded back onto its legacy host at load time (see
// migrateC1JobSaveBack in tests/c1-job-identity-migration.test.js) -- that
// migration is the actual guarantee here, not a raw c1_* currentJobId, which
// no longer resolves to a full job record (state.currentJob, weapon, etc.)
// once the roster no longer lists it.
test('a c1_* save id is never left as currentJobId once migrateC1JobSaveBack has run', () => {
  const migrated = migrateC1JobSaveBack({ currentJobId: 'c1_vanguard', jobs: { c1_vanguard: { level: 5, exp: 0 } } });
  assert.ok(!migrated.currentJobId.startsWith('c1_'));
  state.resetAll();
  state.data.currentJobId = migrated.currentJobId;
  state.data.jobs[migrated.currentJobId] ??= { level: 1, exp: 0 };
  assert.doesNotThrow(() => state.getStats());
});
