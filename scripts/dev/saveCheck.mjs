import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { abs, pathExists } from './lib/repo.mjs';
import { heading, section } from './lib/output.mjs';

let failures = 0;
let warnings = 0;

function pass(msg) {
  console.log(`  PASS  ${msg}`);
}
function warn(msg) {
  warnings += 1;
  console.log(`  WARN  ${msg}`);
}
function fail(msg) {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
}

// Representative fixture shapes — mirrors the shape asserted by
// tests/c1-job-identity-migration.test.js. These are DATA fixtures only:
// they exercise the existing migration, they do not define new schema.
const C1_FIXTURE = {
  currentJobId: 'c1_vanguard',
  jobs: {
    c1_vanguard: { level: 12, exp: 5 },
    c1_oracle: { level: 4, exp: 0 },
    warrior: { level: 3, exp: 0 },
  },
  mastered: ['c1_vanguard'],
  world2: { discoveries: ['x1'], eventsSeen: { we1: 1 } },
  gold: 1234,
};

const LEGACY_FIXTURE = {
  currentJobId: 'archmage',
  jobs: { archmage: { level: 7, exp: 2 }, fighter: { level: 10 } },
  mastered: ['sage'],
  gold: 77,
};

const MIXED_FIXTURE = {
  currentJobId: 'battlemaster',
  jobs: {
    battlemaster: { level: 9, exp: 2 },
    c1_vanguard: { level: 8, exp: 0 },
  },
  mastered: ['battlemaster', 'c1_oracle'],
};

const UNTOUCHED_KEYS = ['world2', 'gold'];

function preservesUntouched(before, after, label) {
  for (const key of UNTOUCHED_KEYS) {
    if (!(key in before)) continue;
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      fail(`${label}: migration mutated unrelated key '${key}' (silent data loss)`);
      return;
    }
  }
  pass(`${label}: unrelated save keys preserved`);
}

export async function runSaveCheck() {
  console.log(heading('Blade Vale — save-check').join('\n'));

  // 1. Save authority files present + wired as expected.
  console.log(section('save authority').join('\n'));
  const stateSrc = pathExists('js/state.js') ? readFileSync(abs('js/state.js'), 'utf8') : null;
  if (!stateSrc) {
    fail('js/state.js missing — cannot verify save authority');
  } else {
    for (const marker of ["'bladevale_save_v1'", 'migrateC1JobSaveBack', 'defaultSave']) {
      if (stateSrc.includes(marker)) pass(`js/state.js contains ${marker}`);
      else fail(`js/state.js missing marker ${marker}`);
    }
  }
  if (!pathExists('js/data/jobIdentityMigration.js')) {
    fail('js/data/jobIdentityMigration.js missing — migration entrypoint gone');
    return summarize();
  }

  // 2. Live schema + migration entrypoint.
  console.log(section('schema + migration entrypoint').join('\n'));
  const { state } = await import('../../js/state.js');
  const migration = await import('../../js/data/jobIdentityMigration.js');
  const { migrateC1JobSaveBack, C1_TO_LEGACY_HOST, legacyHostForC1Job } = migration;

  const expectedKeys = ['gold', 'jobs', 'mastered', 'stageProgress', 'currentJobId'];
  for (const key of expectedKeys) {
    if (key in state.data) pass(`fresh save has '${key}'`);
    else fail(`fresh save missing expected key '${key}'`);
  }
  if (typeof migrateC1JobSaveBack === 'function') pass('migrateC1JobSaveBack importable');
  else {
    fail('migrateC1JobSaveBack not a function');
    return summarize();
  }
  if (typeof legacyHostForC1Job === 'function' && C1_TO_LEGACY_HOST) {
    pass(`C1→legacy host map present (${Object.keys(C1_TO_LEGACY_HOST).length} retired jobs)`);
  } else warn('legacyHostForC1Job/C1_TO_LEGACY_HOST not exported — map unverifiable');

  // 3. Representative old→current migrations.
  console.log(section('representative old → current migrations').join('\n'));

  // c1-only save → folded onto legacy hosts.
  const c1 = migrateC1JobSaveBack(JSON.parse(JSON.stringify(C1_FIXTURE)));
  if (c1.currentJobId === 'battlemaster') pass('c1-only: currentJobId c1_vanguard → battlemaster');
  else fail(`c1-only: currentJobId became '${c1.currentJobId}', expected battlemaster`);
  for (const [c1id, host, lv] of [['c1_vanguard', 'battlemaster', 12], ['c1_oracle', 'astromancer', 4]]) {
    if (c1id in c1.jobs) fail(`c1-only: retired id '${c1id}' still present`);
    else if (c1.jobs[host]?.level >= lv) pass(`c1-only: ${c1id} lv${lv} folded → ${host} lv${c1.jobs[host].level}`);
    else fail(`c1-only: ${c1id} did not fold into ${host} (level ${c1.jobs[host]?.level})`);
  }
  if (c1.jobs.warrior?.level === 3) pass('c1-only: untouched legacy job preserved');
  else fail('c1-only: legacy job (warrior) lost or mutated');
  if (!c1.mastered.includes('c1_vanguard') && c1.mastered.includes('battlemaster')) pass('c1-only: mastered folded to host');
  else fail(`c1-only: mastered = ${JSON.stringify(c1.mastered)}`);
  preservesUntouched(C1_FIXTURE, c1, 'c1-only');

  // legacy-only save → untouched ids preserved.
  const leg = migrateC1JobSaveBack(JSON.parse(JSON.stringify(LEGACY_FIXTURE)));
  if (leg.currentJobId === 'archmage' && leg.jobs.archmage?.level === 7 && leg.jobs.fighter?.level === 10) {
    pass('legacy-only: job ids + levels preserved');
  } else fail(`legacy-only: shape changed unexpectedly — ${JSON.stringify({ id: leg.currentJobId, jobs: leg.jobs })}`);
  if (JSON.stringify(leg.mastered) === JSON.stringify(LEGACY_FIXTURE.mastered)) pass('legacy-only: mastered preserved verbatim');
  else fail(`legacy-only: mastered mutated → ${JSON.stringify(leg.mastered)}`);
  preservesUntouched(LEGACY_FIXTURE, leg, 'legacy-only');

  // mixed save → best-of, c1 entry dropped.
  const mix = migrateC1JobSaveBack(JSON.parse(JSON.stringify(MIXED_FIXTURE)));
  if (mix.jobs.battlemaster?.level === 9 && !('c1_vanguard' in mix.jobs)) {
    pass('mixed: kept higher legacy level, dropped c1 entry');
  } else fail(`mixed: battlemaster=${mix.jobs.battlemaster?.level}, c1_vanguard present=${'c1_vanguard' in mix.jobs}`);
  if (!mix.mastered.includes('c1_oracle') && mix.mastered.includes('astromancer') && mix.mastered.includes('battlemaster')) {
    pass('mixed: mastered folded + deduped');
  } else fail(`mixed: mastered = ${JSON.stringify(mix.mastered)}`);

  // 4. Invariants.
  console.log(section('invariants').join('\n'));
  const twice = migrateC1JobSaveBack(migrateC1JobSaveBack(JSON.parse(JSON.stringify(C1_FIXTURE))));
  const once = migrateC1JobSaveBack(JSON.parse(JSON.stringify(C1_FIXTURE)));
  if (JSON.stringify(twice) === JSON.stringify(once)) pass('migration idempotent (migrate(migrate(x)) == migrate(x))');
  else fail('migration NOT idempotent');

  // every mapped host must be a real job in the active roster
  const { getJob } = await import('../../js/data/jobsPhase8.js');
  const badHosts = Object.entries(C1_TO_LEGACY_HOST ?? {}).filter(([, host]) => !getJob(host));
  if (badHosts.length === 0) pass(`all ${Object.keys(C1_TO_LEGACY_HOST ?? {}).length} legacy hosts resolve in jobsPhase8`);
  else fail(`unresolvable host(s): ${badHosts.map(([c, h]) => `${c}→${h}`).join(', ')}`);

  // migrated currentJobId must also resolve in the active roster
  const c1Once = migrateC1JobSaveBack(JSON.parse(JSON.stringify(C1_FIXTURE)));
  if (getJob(c1Once.currentJobId)) pass(`migrated currentJobId '${c1Once.currentJobId}' resolves via getJob`);
  else fail(`migrated currentJobId '${c1Once.currentJobId}' does not resolve in active roster`);

  // merged-save shape: simulate what load() produces
  const merged = { ...state.data, ...c1Once };
  const defaultKeys = Object.keys(state.data);
  const dropped = defaultKeys.filter((k) => !(k in merged));
  if (dropped.length === 0) pass('defaultSave ∪ migrated save keeps every default key');
  else fail(`merged save drops default keys: ${dropped.join(', ')}`);

  // 5. Existing migration tests still pass.
  console.log(section('existing migration tests').join('\n'));
  const testFiles = ['tests/c1-job-identity-migration.test.js', 'tests/progression3-c1-job-stats.test.js']
    .filter((f) => pathExists(f));
  if (testFiles.length === 0) {
    warn('migration regression test files not found');
  } else {
    try {
      const out = execSync(`node --test ${testFiles.join(' ')}`, { cwd: abs('.'), encoding: 'utf8' });
      const m = out.match(/pass (\d+)/);
      pass(`existing migration tests pass (${m?.[1] ?? '?'} tests)`);
    } catch (e) {
      fail('existing migration tests FAIL — run them directly for detail');
      const tail = (e.stdout ?? '').split('\n').slice(-15).join('\n');
      console.log(tail);
    }
  }

  summarize();
}

function summarize() {
  console.log('');
  console.log(`save-check: ${failures} fail, ${warnings} warn`);
  process.exit(failures === 0 ? 0 : 1);
}
