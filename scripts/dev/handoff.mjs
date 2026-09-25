import { changedFiles, gitBranch, gitHead, gitStatus } from './lib/repo.mjs';
import { heading, section } from './lib/output.mjs';
import { classifyFile, findAuthority, findSystem, getMap } from './map.mjs';

export function runHandoff(args) {
  const target = args.filter((a) => !a.startsWith('-'))[0];
  const map = getMap();

  const lines = [...heading('Blade Vale — handoff packet')];
  const status = gitStatus();
  lines.push(`branch: ${gitBranch()} @ ${gitHead()}`);
  lines.push(`worktree: ${status.length === 0 ? 'clean' : `${status.length} change(s)`}`);

  if (target) {
    // System/authority-focused handoff for the next agent.
    const system = findSystem(map, target);
    const authority = findAuthority(map, target);
    if (!system && !authority) {
      console.error(`no system or authority matches '${target}'`);
      process.exit(1);
    }
    lines.push(`\ntarget: ${target}`);
    if (authority) {
      lines.push(...section('authority'), `  ${authority.title}`);
      for (const f of authority.authority) lines.push(`  ${f}`);
      if (authority.persisted) lines.push(`  saved: ${authority.persisted}`);
      if (authority.notes) lines.push(...section('constraints for next agent'), `  ${authority.notes}`);
      if (authority.validation) lines.push(`  validation: ${authority.validation}`);
    }
    if (system) {
      lines.push(...section(`system: ${system.id} — ${system.title}`));
      lines.push(`  files: ${system.files.length} (see .dev/project-map.json for the full list)`);
      for (const f of system.files.slice(0, 15)) lines.push(`    ${f}`);
      if (system.files.length > 15) lines.push(`    … ${system.files.length - 15} more`);
      if (system.tests.length) {
        lines.push(`  tests: ${system.tests.length}`);
        for (const t of system.tests.slice(0, 15)) lines.push(`    ${t}`);
      }
      if (system.docs?.length) lines.push(...section('docs'), ...system.docs.map((d) => `  ${d}`));
      if (system.dependsOn.length) lines.push(`  depends on: ${system.dependsOn.join(', ')}`);
    }
  } else {
    // Working-tree handoff: group current changes for the next agent.
    const groups = new Map();
    for (const entry of status) {
      const cat = classifyFile(entry.path);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(`${entry.state} ${entry.path}`);
    }
    if (groups.size) {
      lines.push(...section('uncommitted changes by area'));
      for (const [cat, files] of [...groups.entries()].sort()) {
        lines.push(`  ${cat}:`);
        for (const f of files.slice(0, 15)) lines.push(`    ${f}`);
        if (files.length > 15) lines.push(`    … and ${files.length - 15} more`);
      }
      const changed = changedFiles();
      const auths = map.authorities.filter((a) => a.resolvedFiles.some((f) => changed.includes(f)));
      if (auths.length) {
        lines.push(...section('authorities touched — invariants to verify'));
        for (const a of auths) {
          lines.push(`  ${a.id} — ${a.title}`);
          if (a.notes) lines.push(`    ${a.notes}`);
        }
        if (changed.some((f) => map.saveSurfaces.includes(f))) lines.push('  → save surface touched: ./dev save-check');
      }
    }
  }

  lines.push(...section('next-agent checklist'));
  lines.push('  1. read CLAUDE.md + PROJECT_GUIDE.md for authority rules');
  lines.push('  2. ./dev doctor              — environment + config sanity');
  lines.push('  3. npm run test:syntax       — mandatory every commit');
  lines.push('  4. npm test                  — before PR/merge checkpoints');
  lines.push('  5. ./dev save-check          — if save shape changed');
  lines.push('  6. ./dev check               — aggregate gate before handoff');
  console.log(lines.join('\n'));
}
