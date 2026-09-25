import { changedFiles, gitStatus } from './lib/repo.mjs';
import { heading, section } from './lib/output.mjs';
import { classifyFile, findAuthority, findSystem, getMap } from './map.mjs';

export function runScope(args) {
  const target = args.filter((a) => !a.startsWith('-'))[0];
  const map = getMap();
  const status = gitStatus();

  // `./dev scope` with no args → classify the current working tree.
  // `./dev scope <system|authority>` → what a change there would touch.
  if (!target) {
    const lines = [...heading('scope: current working tree')];
    if (status.length === 0) {
      lines.push('worktree clean — nothing to classify. Usage: ./dev scope <system|authority|task>');
      console.log(lines.join('\n'));
      return;
    }
    const groups = new Map();
    for (const entry of status) {
      const cat = classifyFile(entry.path);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(`${entry.state} ${entry.path}`);
    }
    for (const [cat, files] of [...groups.entries()].sort()) {
      lines.push(...section(cat));
      for (const f of files.slice(0, 30)) lines.push(`  ${f}`);
      if (files.length > 30) lines.push(`  … and ${files.length - 30} more`);
    }
    const changed = changedFiles();
    const auths = map.authorities.filter((a) => a.resolvedFiles.some((f) => changed.includes(f)));
    if (auths.length) {
      lines.push(...section('touched authorities — verify invariants before pushing'));
      for (const a of auths) lines.push(`  ${a.id} — ${a.title}`);
      const saveTouched = changed.some((f) => map.saveSurfaces.includes(f));
      if (saveTouched) lines.push('  SAVE SURFACE touched → run ./dev save-check');
    }
    console.log(lines.join('\n'));
    return;
  }

  const system = findSystem(map, target);
  const authority = findAuthority(map, target);
  if (!system && !authority) {
    console.error(`no system or authority matches '${target}'`);
    process.exit(1);
  }

  const lines = [...heading(`scope: ${target}`)];
  if (system) {
    lines.push(`LIKELY IN SCOPE — system ${system.id} (${system.files.length} files)`);
    for (const f of system.files.slice(0, 40)) lines.push(`  ${f}`);
    if (system.files.length > 40) lines.push(`  … and ${system.files.length - 40} more`);
    if (system.tests.length) {
      lines.push('', `RELATED TESTS (${system.tests.length})`);
      for (const t of system.tests.slice(0, 30)) lines.push(`  ${t}`);
    }
    if (system.docs?.length) lines.push('', 'DOCS', ...system.docs.map((d) => `  ${d}`));
    if (system.dependsOn.length) lines.push('', 'DEPENDS ON (read, usually do not touch)', `  ${system.dependsOn.join(', ')}`);
  }
  if (authority) {
    lines.push(`OTHER AUTHORITY — ${authority.id}: ${authority.title}`);
    lines.push('  these files are the source of truth for this concept:');
    for (const f of authority.authority) lines.push(`  ${f}`);
    if (authority.persisted) lines.push(`  saved: ${authority.persisted}`);
    if (authority.notes) lines.push(`  invariants: ${authority.notes}`);
  }
  // Warn about adjacent authorities an agent might accidentally edit.
  const claimedElsewhere = map.authorities.filter(
    (a) => !system || !a.systemsTouched.includes(system.id),
  );
  if (system && claimedElsewhere.length) {
    lines.push('', 'DO NOT TOUCH WITHOUT EXPLICIT NEED — other authority owners:');
    for (const a of claimedElsewhere.slice(0, 12)) lines.push(`  ${a.id.padEnd(14)} ${a.title}`);
    if (claimedElsewhere.length > 12) lines.push(`  … and ${claimedElsewhere.length - 12} more`);
  }
  console.log(lines.join('\n'));
}
