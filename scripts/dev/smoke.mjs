import { execSync } from 'node:child_process';
import { abs, pathExists } from './lib/repo.mjs';
import { heading, section } from './lib/output.mjs';

let failures = 0;

function pass(msg) {
  console.log(`  PASS  ${msg}`);
}
function fail(msg) {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
}

// ./dev smoke — short, "is the repo obviously broken" gate. Not the full suite.

export async function runSmoke() {
  console.log(heading('Blade Vale — smoke').join('\n'));

  console.log(section('critical module imports').join('\n'));
  for (const mod of [
    '../../js/state.js',
    '../../js/battleEngine.js',
    '../../js/data/stages.js',
    '../../js/data/runes2.js',
    '../../js/data/jobsPhase8.js',
    '../../js/data/jobIdentityMigration.js',
  ]) {
    try {
      const m = await import(mod);
      pass(mod.replace('../../', '') + (m.CHAPTERS ? ` (CHAPTERS=${Object.keys(m.CHAPTERS).length})` : ''));
    } catch (e) {
      fail(`${mod} failed to import: ${e.message?.split('\n')[0]}`);
    }
  }

  console.log(section('core data sanity').join('\n'));
  try {
    const { CHAPTER_SPECS, chapterMult } = await import('../../js/data/chapters.js');
    if (CHAPTER_SPECS?.length > 0 && typeof chapterMult === 'function' && chapterMult(1) > 0) {
      pass(`chapters data sane (${CHAPTER_SPECS.length} specs, chapterMult functional)`);
    } else fail('chapters data malformed');
  } catch (e) {
    fail(`chapters import failed: ${e.message}`);
  }
  try {
    const { state } = await import('../../js/state.js');
    if (state?.data?.jobs && state?.data?.stageProgress) pass('default save schema populated');
    else fail('default save schema malformed');
  } catch (e) {
    fail(`state import failed: ${e.message}`);
  }

  console.log(section('save roundtrip sanity').join('\n'));
  try {
    const { migrateC1JobSaveBack } = await import('../../js/data/jobIdentityMigration.js');
    const fixture = { currentJobId: 'c1_vanguard', jobs: { c1_vanguard: { level: 8 } }, mastered: ['c1_vanguard'] };
    const out = migrateC1JobSaveBack(fixture);
    if (out.currentJobId === 'battlemaster' && !('c1_vanguard' in out.jobs)) pass('c1 migration folds onto legacy hosts');
    else fail('c1 migration output unexpected');
  } catch (e) {
    fail(`migration sanity failed: ${e.message}`);
  }

  console.log(section('representative regression subset').join('\n'));
  const subset = ['tests/c1-job-identity-migration.test.js', 'tests/rift-entry.test.js'].filter((f) => pathExists(f));
  if (!subset.length) {
    console.log('  (no curated test files found — skipping)');
  } else {
    try {
      execSync(`node --test ${subset.join(' ')}`, { cwd: abs('.'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      pass(`curated subset green (${subset.map((s) => s.split('/').pop()).join(', ')})`);
    } catch {
      fail(`curated subset failing — run: node --test ${subset.join(' ')}`);
    }
  }

  console.log('');
  console.log(`smoke: ${failures} fail`);
  console.log('full gate: ./dev check   (syntax + full suite)');
  process.exit(failures === 0 ? 0 : 1);
}
