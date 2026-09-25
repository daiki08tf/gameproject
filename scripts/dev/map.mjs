import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  abs,
  canonicalJson,
  gitBranch,
  gitHead,
  gitRemote,
  importedPaths,
  listProjectFiles,
  pathExists,
  readJsonFile,
} from './lib/repo.mjs';
import { heading } from './lib/output.mjs';

export const SYSTEMS_PATH = '.dev/systems.json';
export const AUTHORITY_PATH = '.dev/authority-map.json';
export const MAP_PATH = '.dev/project-map.json';

const CODE_RE = /\.m?js$/;

export function loadSystems() {
  return readJsonFile(SYSTEMS_PATH)?.systems ?? [];
}

export function loadAuthorities() {
  return readJsonFile(AUTHORITY_PATH)?.authorities ?? [];
}

function matchesPrefix(path, prefix) {
  if (prefix.endsWith('/')) return path.startsWith(prefix);
  if (prefix.startsWith('*.')) return path.endsWith(prefix.slice(1));
  return path.startsWith(prefix);
}

function bucketFor(path, systems) {
  for (const system of systems) {
    if ((system.paths ?? []).some((prefix) => matchesPrefix(path, prefix))) return system.id;
  }
  return 'unmapped';
}

function isTestFile(path) {
  return path.startsWith('tests/');
}

function dedupe(values) {
  return [...new Set(values)].sort();
}

function orderByRef(map, key, refs) {
  // Keep reference-order stable for list outputs.
  return (refs ?? []).filter((r) => map.has(r)).map((r) => map.get(r));
}

export function buildProjectMap() {
  const systems = loadSystems();
  const authorities = loadAuthorities();
  const allFiles = listProjectFiles();
  const codeFiles = allFiles.filter((f) => CODE_RE.test(f));
  const testFiles = allFiles.filter(isTestFile);

  // Import graph across code files (including tests — they import the modules
  // they cover, which is exactly what impact/test-association needs).
  const importGraph = new Map();
  const reverseGraph = new Map();
  for (const file of codeFiles) {
    const imports = importedPaths(file);
    importGraph.set(file, imports);
    for (const target of imports) {
      if (!reverseGraph.has(target)) reverseGraph.set(target, []);
      reverseGraph.get(target).push(file);
    }
  }

  const systemFiles = new Map();
  const fileSystem = new Map();
  const unmappedFiles = [];

  for (const file of allFiles) {
    const systemId = bucketFor(file, systems);
    fileSystem.set(file, systemId);
    if (systemId === 'unmapped') {
      unmappedFiles.push(file);
    } else {
      if (!systemFiles.has(systemId)) systemFiles.set(systemId, []);
      systemFiles.get(systemId).push(file);
    }
  }

  const resultSystems = systems.map((system) => {
    const id = system.id;
    const files = (systemFiles.get(id) ?? []).sort();
    // Related tests = test files that statically import any file the system
    // owns (the 'tests' bucket itself just holds the raw test inventory).
    const tests = id === 'tests'
      ? files
      : dedupe(files.flatMap((file) => (reverseGraph.get(file) ?? []).filter(isTestFile)));

    const dependsOn = dedupe(
      files
        .flatMap((file) => (importGraph.get(file) ?? []).map((target) => fileSystem.get(target)))
        .filter((target) => target && target !== 'unmapped' && target !== id),
    );
    const dependents = dedupe(
      files
        .flatMap((file) => (reverseGraph.get(file) ?? []).map((source) => fileSystem.get(source)))
        .filter((source) => source && source !== 'unmapped' && source !== id),
    );

    const importers = dedupe(files.flatMap((file) => reverseGraph.get(file) ?? []));

    return {
      id,
      title: system.title,
      concepts: system.concepts ?? [],
      files,
      tests,
      docs: system.docs ?? [],
      dependsOn,
      dependents,
      importers,
    };
  });

  const systemIndex = new Map(resultSystems.map((s) => [s.id, s]));

  const resultAuthorities = authorities.map((auth) => {
    const authorityPaths = dedupe([
      ...(auth.authority ?? []),
      ...(auth.mutation ?? []).filter((m) => pathExists(m)),
      ...(auth.persisted ? [auth.persisted].filter((m) => pathExists(m)) : []),
    ]);
    const resolvedFiles = [];
    const missingPaths = [];
    for (const path of authorityPaths) {
      if (pathExists(path)) resolvedFiles.push(path);
      else missingPaths.push(path);
    }
    const systemsTouched = dedupe(resolvedFiles.map((file) => fileSystem.get(file)).filter(Boolean));
    const relatedTests = dedupe(
      resolvedFiles.flatMap((file) => (reverseGraph.get(file) ?? []).filter(isTestFile)),
    );
    return {
      id: auth.id,
      title: auth.title,
      authority: authorityPaths,
      derived: auth.derived ?? [],
      persisted: auth.persisted,
      mutation: auth.mutation ?? [],
      validation: auth.validation,
      notes: auth.notes,
      resolvedFiles,
      missingPaths,
      systemsTouched,
      relatedTests,
    };
  });

  // Save-surface hint: files that read or write the persisted save root.
  const saveSurfaces = resolvedSaveSurfaces(codeFiles);

  return {
    meta: {
      schemaVersion: 1,
      generator: 'scripts/dev/map.mjs',
      git: { branch: gitBranch(), head: gitHead(), remote: gitRemote() },
      fileCounts: {
        total: allFiles.length,
        code: codeFiles.length,
        tests: testFiles.length,
      },
    },
    systems: resultSystems,
    authorities: resultAuthorities,
    saveSurfaces,
    unmappedFiles,
  };
}

function resolvedSaveSurfaces(codeFiles) {
  // Files that mention the save root or the migration entrypoint — heuristic
  // surface list for impact/scope, not a claim of authority.
  const markers = ["'bladevale_save_v1'", '"bladevale_save_v1"', 'migrateC1JobSaveBack', 'state.data'];
  const out = [];
  for (const file of codeFiles) {
    let src;
    try {
      src = readFileSync(abs(file), 'utf8');
    } catch {
      continue;
    }
    if (markers.some((m) => src.includes(m))) out.push(file);
  }
  return out.sort();
}

export function serializeMap(map) {
  const { meta, systems, authorities, saveSurfaces, unmappedFiles } = map;
  return `${JSON.stringify({ meta, systems, authorities, saveSurfaces, unmappedFiles }, null, 2)}\n`;
}

export function readProjectMap() {
  return readJsonFile(MAP_PATH);
}

export function writeProjectMap(map) {
  const full = abs(MAP_PATH);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, serializeMap(map));
}

export function getMap() {
  return readProjectMap() ?? buildProjectMap();
}

export function mapIsFresh() {
  const stored = readProjectMap();
  if (!stored) return { fresh: false, reason: 'missing' };
  const built = buildProjectMap();
  // Compare everything except the git meta (head/branch change on every commit).
  const a = JSON.parse(canonicalJson({ ...stored, meta: { ...stored.meta, git: null } }));
  const b = JSON.parse(canonicalJson({ ...built, meta: { ...built.meta, git: null } }));
  const equal = canonicalJson(a) === canonicalJson(b);
  return { fresh: equal, reason: equal ? null : 'stale' };
}

export function findSystem(map, query) {
  const q = query.toLowerCase();
  return (map?.systems ?? []).find(
    (s) =>
      s.id === q ||
      (s.concepts ?? []).some((c) => c === q) ||
      (s.title ?? '').toLowerCase().includes(q),
  );
}

export function findAuthority(map, query) {
  const q = query.toLowerCase();
  return (map?.authorities ?? []).find(
    (a) => a.id === q || (a.title ?? '').toLowerCase().includes(q),
  );
}

export function classifyFile(path) {
  const p = path.replace(/^\.\//, '');
  if (p === 'js/state.js' || p === 'js/data/jobIdentityMigration.js') return 'save';
  if (p.startsWith('tests/')) return 'tests';
  if (p.startsWith('scripts/dev/') || p.startsWith('.dev/') || p === 'dev' || p.startsWith('.github/')) return 'devtools';
  if (p.startsWith('scripts/')) return 'scripts';
  if (p.endsWith('.md') || p.startsWith('docs/')) return 'docs';
  if (p.startsWith('js/ui/') || p.startsWith('css/') || p === 'index.html') return 'ui';
  if (p.startsWith('js/screens/')) return 'screens';
  if (p.startsWith('js/patches/')) return 'patches';
  if (p.startsWith('js/data/')) return 'data';
  if (p.startsWith('js/')) return 'engine';
  if (p.startsWith('assets/')) return 'assets';
  return 'other';
}

export function runMap(args) {
  const map = getMap();
  const write = args.includes('--write');
  const check = args.includes('--check');

  if (write) {
    writeProjectMap(buildProjectMap());
    console.log(`wrote ${MAP_PATH}`);
    return;
  }

  if (check) {
    const { fresh, reason } = mapIsFresh();
    if (fresh) {
      console.log('project-map.json is fresh');
      return;
    }
    console.log(`project-map.json is ${reason} — regenerate with ./dev map --write`);
    process.exit(1);
  }

  const lines = [...heading('Blade Vale — project map')];
  const git = map.meta.git;
  lines.push(`branch ${git.branch}  head ${git.head}  files ${map.meta.fileCounts.total} (code ${map.meta.fileCounts.code}, tests ${map.meta.fileCounts.tests})`, '');
  lines.push('systems:');
  for (const s of map.systems) {
    lines.push(
      `  ${s.id.padEnd(14)} ${String(s.files.length).padStart(4)} files  ${String(s.tests.length).padStart(3)} tests` +
        (s.dependsOn.length ? `  needs: ${s.dependsOn.join(', ')}` : ''),
    );
  }
  lines.push('', 'authorities:');
  for (const a of map.authorities) {
    lines.push(`  ${a.id.padEnd(14)} ${a.title}`);
  }
  if (map.unmappedFiles.length) {
    lines.push('', `unmapped files: ${map.unmappedFiles.length}`);
    for (const f of map.unmappedFiles.slice(0, 20)) lines.push(`  ${f}`);
    if (map.unmappedFiles.length > 20) lines.push(`  … and ${map.unmappedFiles.length - 20} more`);
  }
  const { fresh } = mapIsFresh();
  lines.push('', `map file: ${existsSync(abs(MAP_PATH)) ? (fresh ? 'fresh' : 'STALE — run ./dev map --write') : 'not generated yet (run ./dev map --write)'}`);
  console.log(lines.join('\n'));
}
