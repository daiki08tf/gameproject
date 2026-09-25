import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  AUTHORITY_PATH,
  MAP_PATH,
  SYSTEMS_PATH,
  buildProjectMap,
  classifyFile,
  findAuthority,
  findSystem,
  loadAuthorities,
  loadSystems,
  mapIsFresh,
  readProjectMap,
} from '../scripts/dev/map.mjs';
import { abs, importedPaths, listProjectFiles, readJsonFile } from '../scripts/dev/lib/repo.mjs';

const CLI = 'scripts/dev/cli.mjs';
const dev = (args) =>
  execSync(`node ${CLI} ${args}`, { cwd: abs('.'), encoding: 'utf8' });

// One shared build per test run — map building scans the repo once (~1-2s).
const builtMap = buildProjectMap();

test('systems config: every system has id/title/paths', () => {
  const systems = loadSystems();
  assert.ok(systems.length >= 10, 'expected at least 10 systems');
  const ids = new Set();
  for (const s of systems) {
    assert.ok(s.id, 'system missing id');
    assert.ok(s.title, `${s.id} missing title`);
    assert.ok(Array.isArray(s.paths) && s.paths.length > 0, `${s.id} missing paths`);
    assert.ok(!ids.has(s.id), `duplicate system id ${s.id}`);
    ids.add(s.id);
  }
});

test('authority-map config: every authority has id/title/authority', () => {
  const auths = loadAuthorities();
  assert.ok(auths.length >= 10, 'expected at least 10 authorities');
  const ids = new Set();
  for (const a of auths) {
    assert.ok(a.id, 'authority missing id');
    assert.ok(a.title, `${a.id} missing title`);
    assert.ok(Array.isArray(a.authority) && a.authority.length > 0, `${a.id} missing authority list`);
    assert.ok(!ids.has(a.id), `duplicate authority id ${a.id}`);
    ids.add(a.id);
  }
});

test('buildProjectMap: deterministic across builds', () => {
  const again = buildProjectMap();
  const strip = ({ meta, ...rest }) => ({ ...rest });
  assert.deepEqual(strip(again), strip(builtMap), 'map is not deterministic');
});

test('buildProjectMap: every authority path resolves', () => {
  const missing = builtMap.authorities.flatMap((a) => a.missingPaths.map((p) => `${a.id}: ${p}`));
  assert.deepEqual(missing, [], 'authority-map references files that do not exist');
});

test('buildProjectMap: every code file belongs to a system', () => {
  const unmapped = builtMap.unmappedFiles.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
  assert.deepEqual(unmapped, [], `unmapped code files — extend ${SYSTEMS_PATH}`);
});

test('committed project-map.json is fresh', () => {
  assert.ok(existsSync(abs(MAP_PATH)), `${MAP_PATH} missing — run ./dev map --write`);
  const { fresh, reason } = mapIsFresh();
  assert.ok(fresh, `${MAP_PATH} is ${reason} — run ./dev map --write`);
});

test('save surfaces detection finds the real save files', () => {
  assert.ok(builtMap.saveSurfaces.includes('js/state.js'));
  assert.ok(builtMap.saveSurfaces.includes('js/data/jobIdentityMigration.js'));
});

test('system and authority resolution', () => {
  assert.equal(findSystem(builtMap, 'jobs')?.id, 'jobs');
  assert.equal(findSystem(builtMap, 'adventure')?.id, 'adventure4', 'concept alias should resolve');
  assert.equal(findSystem(builtMap, 'definitely-not-a-system'), undefined);
  assert.equal(findAuthority(builtMap, 'save')?.id, 'save');
  assert.equal(findAuthority(builtMap, 'loot')?.id, 'loot');
  assert.equal(findAuthority(builtMap, 'nope'), undefined);
});

test('system entries have the fields commands rely on', () => {
  for (const s of builtMap.systems) {
    assert.ok(Array.isArray(s.files), `${s.id} missing files[]`);
    assert.ok(Array.isArray(s.tests), `${s.id} missing tests[]`);
    assert.ok(Array.isArray(s.dependsOn), `${s.id} missing dependsOn[]`);
    assert.ok(Array.isArray(s.dependents), `${s.id} missing dependents[]`);
    assert.ok(!s.dependsOn.includes(s.id), `${s.id} depends on itself`);
  }
});

test('jobs system owns the job files and sees its migration tests', () => {
  const jobs = builtMap.systems.find((s) => s.id === 'jobs');
  assert.ok(jobs.files.includes('js/data/jobsPhase8.js'));
  assert.ok(jobs.files.includes('js/data/jobIdentityMigration.js'));
  assert.ok(jobs.tests.includes('tests/c1-job-identity-migration.test.js'));
});

test('save authority resolves both owners and its regression tests', () => {
  const save = builtMap.authorities.find((a) => a.id === 'save');
  assert.ok(save.resolvedFiles.includes('js/state.js'));
  assert.ok(save.resolvedFiles.includes('js/data/jobIdentityMigration.js'));
  assert.ok(save.relatedTests.includes('tests/c1-job-identity-migration.test.js'));
});

test('classifyFile sorts paths into the expected buckets', () => {
  assert.equal(classifyFile('js/state.js'), 'save');
  assert.equal(classifyFile('js/data/jobIdentityMigration.js'), 'save');
  assert.equal(classifyFile('js/data/jobs.js'), 'data');
  assert.equal(classifyFile('js/patches/rune2Core.js'), 'patches');
  assert.equal(classifyFile('js/screens/jobs.js'), 'screens');
  assert.equal(classifyFile('tests/jobs.test.js'), 'tests');
  assert.equal(classifyFile('CLAUDE.md'), 'docs');
  assert.equal(classifyFile('scripts/dev/map.mjs'), 'devtools');
  assert.equal(classifyFile('dev'), 'devtools');
});

test('importedPaths resolves relative js imports', () => {
  const imports = importedPaths('js/state.js');
  assert.ok(imports.includes('js/data/jobIdentityMigration.js'), `state.js imports: ${imports}`);
});

test('cli: help lists all commands', () => {
  const out = dev('help');
  for (const cmd of ['doctor', 'status', 'map', 'authority', 'impact', 'scope', 'context', 'handoff', 'save-check', 'smoke', 'check']) {
    assert.ok(out.includes(cmd), `help missing ${cmd}`);
  }
});

test('cli: unknown command exits 1', () => {
  assert.throws(() => dev('frobnicate'), /Command failed/);
});

test('cli: authority --check exits clean', () => {
  const out = dev('authority --check');
  assert.match(out, /authority map OK/);
});

test('cli: authority on unknown id exits 1', () => {
  assert.throws(() => dev('authority definitely-not-real'), /Command failed/);
});

test('cli: map --check passes on committed map', () => {
  const out = dev('map --check');
  assert.match(out, /fresh/);
});

test('cli: impact on a real path names its authority claim', () => {
  const out = dev('impact js/data/jobIdentityMigration.js');
  assert.match(out, /claimed by authority/);
  assert.match(out, /SAVE SURFACE/);
});

test('cli: context on a system prints packet sections', () => {
  const out = dev('context jobs');
  assert.match(out, /AUTHORITY/);
  assert.match(out, /source of truth/);
  assert.match(out, /relevant tests|key files/);
});

test('cli: save-check is green on the real repo', () => {
  const out = dev('save-check');
  assert.match(out, /save-check: 0 fail/);
});

test('cli: smoke is green on the real repo', () => {
  const out = dev('smoke');
  assert.match(out, /smoke: 0 fail/);
});
