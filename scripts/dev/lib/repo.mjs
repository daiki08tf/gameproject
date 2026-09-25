import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// scripts/dev/lib/repo.mjs — shared helpers: paths, file inventory, import graph, git state.

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'coverage', '.devin']);
const CODE_RE = /\.m?js$/;

export function rel(path) {
  return relative(ROOT, path).split(sep).join('/');
}

export function abs(path) {
  return resolve(ROOT, path);
}

export function pathExists(path) {
  return existsSync(abs(path));
}

export function readJsonFile(path) {
  const file = abs(path);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
}

function listFilesRecursive(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.dev' && entry.name !== '.github') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      out.push(...listFilesRecursive(full));
    } else if (entry.isFile()) {
      out.push(rel(full));
    }
  }
  return out;
}

export function listProjectFiles() {
  return listFilesRecursive(ROOT);
}

export function fileSizeBytes(path) {
  try {
    return statSync(abs(path)).size;
  } catch {
    return 0;
  }
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

const IMPORT_RE = /import\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]/g;

export function importedPaths(sourcePath) {
  // Resolve static `import ... from './x.js'` specifiers to repo-relative paths.
  // Blade Vale uses explicit .js extensions; try a small set of fallbacks.
  const full = abs(sourcePath);
  const src = readFileSync(full, 'utf8');
  const out = new Set();
  for (const match of src.matchAll(IMPORT_RE)) {
    const spec = match[1];
    if (!spec.startsWith('.')) continue;
    const base = resolve(dirname(full), spec);
    const candidates = CODE_RE.test(base)
      ? [base]
      : [`${base}.js`, `${base}.mjs`, `${base}/index.js`];
    for (const c of candidates) {
      if (existsSync(c)) {
        out.add(rel(c));
        break;
      }
    }
  }
  return [...out].sort();
}

function git(args) {
  try {
    return execSync(`git -C ${ROOT} ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export function gitHead() {
  return git('rev-parse --short HEAD') ?? 'unknown';
}

export function gitBranch() {
  return git('rev-parse --abbrev-ref HEAD') ?? 'unknown';
}

export function gitRemote() {
  return git('remote get-url origin') ?? null;
}

export function gitStatus() {
  const raw = git('status --porcelain');
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map((line) => ({
    state: line.slice(0, 2),
    path: line.slice(3).replace(/^"(.*)"$/, '$1'),
  }));
}

export function changedFiles() {
  return gitStatus().map((e) => e.path);
}
