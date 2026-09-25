import { importedPaths, listProjectFiles, pathExists } from './lib/repo.mjs';
import { heading, section, fail } from './lib/output.mjs';
import { findAuthority, findSystem, getMap } from './map.mjs';

const CODE_RE = /\.m?js$/;

function importersOf(file) {
  // Per-file import edges aren't serialized in project-map.json — rescan.
  // One pass over code files; acceptable for an on-demand command.
  const out = [];
  for (const f of listProjectFiles().filter((p) => CODE_RE.test(p))) {
    if (f !== file && importedPaths(f).includes(file)) out.push(f);
  }
  return out.sort();
}

export function runImpact(args) {
  const target = args.filter((a) => !a.startsWith('-'))[0];
  if (!target) fail('usage: ./dev impact <path|system|authority>');

  const map = getMap();
  const lines = [...heading(`impact: ${target}`)];

  const system = findSystem(map, target);
  const authority = findAuthority(map, target);
  const asPath = target.replace(/^\.\//, '');
  const isFile = pathExists(asPath);

  if (system) {
    lines.push(`system: ${system.id} — ${system.title}`, '');
    if (system.dependents.length) lines.push(...section('depended on by (static import)'), `  ${system.dependents.join(', ')}`);
    if (system.dependsOn.length) lines.push(...section('depends on'), `  ${system.dependsOn.join(', ')}`);
    if (system.tests.length) {
      lines.push(...section(`tests (${system.tests.length})`), ...system.tests.slice(0, 40).map((t) => `  ${t}`));
      if (system.tests.length > 40) lines.push(`  … and ${system.tests.length - 40} more`);
    }
    if (system.docs?.length) lines.push(...section('docs'), ...system.docs.map((d) => `  ${d}`));
    const touched = map.authorities.filter((a) => a.systemsTouched.includes(system.id));
    if (touched.length) lines.push(...section('authorities claiming files in this system'), ...touched.map((a) => `  ${a.id} — ${a.title}`));
    const sysSave = system.files.filter((f) => map.saveSurfaces.includes(f));
    if (sysSave.length) {
      lines.push(...section('SAVE-COMPATIBILITY SURFACE'), `  ${sysSave.length} file(s) touch the save root or migration entrypoint:`);
      for (const f of sysSave.slice(0, 15)) lines.push(`  ${f}`);
      lines.push('  → run ./dev save-check after changing save shape');
    }
    lines.push(...section(`files (${system.files.length})`), ...system.files.slice(0, 25).map((f) => `  ${f}`));
    if (system.files.length > 25) lines.push(`  … and ${system.files.length - 25} more — see .dev/project-map.json`);
  } else if (authority) {
    lines.push(`authority: ${authority.id} — ${authority.title}`, '');
    lines.push(...section('source of truth'), ...authority.authority.map((f) => `  ${f}`));
    if (authority.persisted) lines.push(...section('persisted'), `  ${authority.persisted}`);
    if (authority.relatedTests.length) {
      lines.push(...section(`related tests (${authority.relatedTests.length})`), ...authority.relatedTests.slice(0, 30).map((t) => `  ${t}`));
    }
    const dependentSystems = map.systems.filter((s) => s.dependsOn.some((d) => authority.systemsTouched.includes(d)));
    if (dependentSystems.length) lines.push(...section('systems depending on its files'), `  ${dependentSystems.map((s) => s.id).join(', ')}`);
    if (authority.notes) lines.push(...section('notes'), `  ${authority.notes}`);
  } else if (isFile) {
    const owning = map.systems.find((s) => s.files.includes(asPath));
    lines.push(`file: ${asPath}`, `system: ${owning?.id ?? 'unmapped'}`, '');
    const auths = map.authorities.filter((a) => a.resolvedFiles.includes(asPath));
    if (auths.length) {
      lines.push(...section('claimed by authority'));
      for (const a of auths) {
        lines.push(`  ${a.id} — ${a.title}`);
        if (a.persisted) lines.push(`    saved: ${a.persisted}`);
      }
    }
    if (map.saveSurfaces.includes(asPath)) {
      lines.push(...section('SAVE SURFACE'), '  touches the save root or migration entrypoint — verify ./dev save-check');
    }
    const direct = importersOf(asPath);
    if (direct.length) {
      lines.push(...section(`direct importers (${direct.length})`));
      const tests = direct.filter((f) => f.startsWith('tests/'));
      const other = direct.filter((f) => !f.startsWith('tests/'));
      for (const f of other.slice(0, 30)) lines.push(`  ${f}`);
      if (tests.length) {
        lines.push(`  tests importing it (${tests.length}):`);
        for (const t of tests.slice(0, 20)) lines.push(`    ${t}`);
      }
    }
    const authTests = map.authorities
      .filter((a) => a.resolvedFiles.includes(asPath))
      .flatMap((a) => a.relatedTests);
    if (authTests.length) lines.push(...section('authority-related tests'), ...[...new Set(authTests)].slice(0, 20).map((t) => `  ${t}`));
    if (!auths.length && !direct.length && !map.saveSurfaces.includes(asPath)) {
      lines.push('', 'no authority claim, no save surface, no importers found — low blast radius (verify before assuming zero)');
    }
  } else {
    const known = [...map.systems.map((s) => s.id), ...map.authorities.map((a) => a.id)].join(', ');
    fail(`unknown target '${target}' — not a system id, authority id, concept, or existing path\n  known: ${known}`);
  }

  console.log(lines.join('\n'));
}
