import { heading, section, fail } from './lib/output.mjs';
import { findAuthority, findSystem, getMap } from './map.mjs';

export function runContext(args) {
  const target = args.filter((a) => !a.startsWith('-'))[0];
  if (!target) fail('usage: ./dev context <system|authority|concept>');

  const map = getMap();
  const system = findSystem(map, target);
  const authority = findAuthority(map, target);
  if (!system && !authority) {
    const known = [...map.systems.map((s) => s.id), ...map.authorities.map((a) => a.id)].join(', ');
    fail(`unknown target '${target}'\n  known: ${known}`);
  }

  const lines = [...heading(`context: ${target}`)];

  if (authority) {
    lines.push(`AUTHORITY — ${authority.title}`, '');
    lines.push(...section('source of truth'), ...authority.authority.map((f) => `  ${f}`));
    if (authority.persisted) lines.push(...section('persisted state / save implications'), `  ${authority.persisted}`);
    if (authority.mutation?.length) lines.push(...section('mutation points'), ...authority.mutation.map((m) => `  ${m}`));
    if (authority.notes) lines.push(...section('known constraints / invariants'), `  ${authority.notes}`);
    if (authority.validation) lines.push(...section('validation'), `  ${authority.validation}`);
  }

  if (system) {
    lines.push(`SYSTEM — ${system.id}: ${system.title}`, '');
    if (system.concepts?.length) lines.push(`  concepts: ${system.concepts.join(', ')}`);
    if (system.dependsOn.length) lines.push(`  depends on: ${system.dependsOn.join(', ')}`);
    if (system.dependents.length) lines.push(`  depended on by: ${system.dependents.join(', ')}`);
    lines.push(...section(`key files (${system.files.length})`), ...system.files.slice(0, 30).map((f) => `  ${f}`));
    if (system.files.length > 30) lines.push(`  … and ${system.files.length - 30} more in .dev/project-map.json`);
    if (system.tests.length) {
      lines.push(...section(`relevant tests (${system.tests.length})`), ...system.tests.slice(0, 25).map((t) => `  ${t}`));
      if (system.tests.length > 25) lines.push(`  … and ${system.tests.length - 25} more`);
    }
    if (system.docs?.length) lines.push(...section('docs to read first'), ...system.docs.map((d) => `  ${d}`));
    const auths = map.authorities.filter((a) => a.systemsTouched.includes(system.id));
    if (auths.length) {
      lines.push(...section('authorities owning files in this system'));
      for (const a of auths) lines.push(`  ${a.id} — ${a.title}${a.persisted ? ` (saved: ${a.persisted})` : ''}`);
    }
  }

  lines.push(...section('next steps'), '  ./dev authority <id>   — full invariants', '  ./dev impact <id>     — blast radius', '  ./dev save-check      — if save shape is touched', '  ./dev smoke           — quick sanity after edits');
  console.log(lines.join('\n'));
}
