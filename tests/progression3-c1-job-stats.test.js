import test from 'node:test';
import assert from 'node:assert/strict';

import { state } from '../js/state.js';
// Loads the progression3Core.js patch chain (chainMethod'd onto state.getStats())
// so this test exercises the exact reachable path battle entry/status use.
import '../js/patches/progression3Core.js';
import { C1_RUNTIME_JOBS } from '../js/data/jobIdentityMigration.js';

// Regression for: progression3Core.js imported computeStats()/getJob() straight
// from the legacy data/jobs.js registry, which has no entries for c1_* job ids
// (the default currentJobId on every fresh save since the C1 Job Identity
// Rework). That made getStats() throw "Cannot read properties of undefined
// (reading 'tier')" for any c1_* current job -- i.e. on every fresh save --
// breaking battle entry, the status screen, and anything else stat-dependent.
test('getStats() does not crash for a C1 job identity current job', () => {
  state.resetAll();
  assert.ok(state.data.currentJobId.startsWith('c1_'), 'fresh saves default to a C1 job identity');
  assert.doesNotThrow(() => state.getStats());
  const stats = state.getStats();
  for (const key of ['hp', 'mp', 'atk', 'def', 'mag', 'spd']) {
    assert.ok(Number.isFinite(stats[key]), `${key} must be a finite number, got ${stats[key]}`);
    assert.ok(stats[key] > 0, `${key} must be positive`);
  }
});

test('getStats() stays crash-free across every C1 job identity, not just the default', () => {
  state.resetAll();
  for (const job of C1_RUNTIME_JOBS) {
    state.data.jobs[job.id] ??= { level: 1, exp: 0 };
    state.data.currentJobId = job.id;
    assert.doesNotThrow(() => state.getStats(), `getStats() crashed for ${job.id}`);
  }
});
