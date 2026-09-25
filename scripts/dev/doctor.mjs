import { existsSync, readFileSync } from 'node:fs';
import { abs, gitStatus, pathExists, readJsonFile } from './lib/repo.mjs';
import { heading, section } from './lib/output.mjs';
import {
  AUTHORITY_PATH,
  MAP_PATH,
  SYSTEMS_PATH,
  buildProjectMap,
  loadAuthorities,
  loadSystems,
  mapIsFresh,
} from './map.mjs';

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

export function runDoctor() {
  console.log(heading('Blade Vale — doctor').join('\n'));

  console.log(section('environment').join('\n'));
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor >= 22) pass(`node ${process.versions.node} (CI uses 22)`);
  else fail(`node ${process.versions.node} — CI uses 22, upgrade`);

  const pkg = readJsonFile('package.json');
  if (!pkg) fail('package.json missing');
  else {
    pass(`package.json name=${pkg.name}`);
    for (const script of ['test', 'test:syntax']) {
      if (pkg.scripts?.[script]) pass(`npm script '${script}' present`);
      else fail(`npm script '${script}' missing`);
    }
    if (!pkg.dependencies || Object.keys(pkg.dependencies).length === 0) pass('zero runtime dependencies');
    else warn(`runtime dependencies present: ${Object.keys(pkg.dependencies).join(', ')}`);
  }

  console.log(section('required paths').join('\n'));
  const required = [
    'index.html',
    'js/',
    'js/data/',
    'js/patches/',
    'js/screens/',
    'js/ui/',
    'css/',
    'tests/',
    'scripts/',
    'CLAUDE.md',
    'PROJECT_GUIDE.md',
    'README.md',
    'docs/MUTATION_OBSERVER_SAFETY.md',
    SYSTEMS_PATH,
    AUTHORITY_PATH,
    'dev',
    'scripts/dev/cli.mjs',
  ];
  for (const p of required) {
    if (pathExists(p)) pass(p);
    else fail(`${p} missing`);
  }

  console.log(section('ci').join('\n'));
  const ci = '.github/workflows/test.yml';
  if (!existsSync(abs(ci))) fail(`${ci} missing`);
  else {
    const src = readFileSync(abs(ci), 'utf8');
    if (src.includes('test:syntax')) pass('CI runs test:syntax');
    else warn('CI does not run test:syntax');
    if (src.includes('npm test')) pass('CI runs npm test');
    else warn('CI does not run npm test');
  }

  console.log(section('dev-infra config').join('\n'));
  const systems = loadSystems();
  const authorities = loadAuthorities();
  if (systems.length) pass(`${SYSTEMS_PATH}: ${systems.length} systems`);
  else fail(`${SYSTEMS_PATH} empty or unparseable`);
  if (authorities.length) pass(`${AUTHORITY_PATH}: ${authorities.length} authorities`);
  else fail(`${AUTHORITY_PATH} empty or unparseable`);

  const map = buildProjectMap();
  const missing = map.authorities.flatMap((a) => a.missingPaths.map((m) => `${a.id}: ${m}`));
  if (missing.length === 0) pass('all authority-map paths resolve');
  else {
    fail(`${missing.length} authority-map path(s) missing:`);
    for (const m of missing) console.log(`        ${m}`);
  }

  const unmappedCode = map.unmappedFiles.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
  if (unmappedCode.length === 0) pass('every code file maps to a system');
  else {
    warn(`${unmappedCode.length} code file(s) unmapped — add a prefix to ${SYSTEMS_PATH}:`);
    for (const f of unmappedCode.slice(0, 15)) console.log(`        ${f}`);
  }

  const { fresh, reason } = mapIsFresh();
  if (!existsSync(abs(MAP_PATH))) warn(`${MAP_PATH} not generated — run ./dev map --write`);
  else if (fresh) pass(`${MAP_PATH} fresh`);
  else warn(`${MAP_PATH} stale (${reason}) — run ./dev map --write`);

  console.log(section('save-check availability').join('\n'));
  for (const p of ['js/state.js', 'js/data/jobIdentityMigration.js']) {
    if (pathExists(p)) pass(p);
    else fail(`${p} missing — save-check cannot run`);
  }

  console.log(section('git').join('\n'));
  const status = gitStatus();
  if (status.length === 0) pass('worktree clean');
  else warn(`worktree dirty (${status.length} entries) — advisory only`);

  console.log('');
  console.log(`doctor: ${failures} fail, ${warnings} warn`);
  process.exit(failures === 0 ? 0 : 1);
}
