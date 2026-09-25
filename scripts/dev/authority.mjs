import { heading, section, fail } from './lib/output.mjs';
import { findAuthority, getMap } from './map.mjs';

export function runAuthority(args) {
  const map = getMap();
  const check = args.includes('--check');
  const query = args.filter((a) => !a.startsWith('-'))[0];

  if (check) {
    const missing = map.authorities.flatMap((a) => a.missingPaths.map((m) => `${a.id}: ${m}`));
    if (missing.length === 0) {
      console.log(`authority map OK — ${map.authorities.length} authorities, all paths resolve`);
      return;
    }
    console.error(`${missing.length} missing path(s):`);
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
  }

  if (!query) {
    const lines = [...heading('Blade Vale — authority map')];
    for (const a of map.authorities) {
      lines.push(`${a.id.padEnd(14)} ${a.title}`);
      for (const f of a.authority.slice(0, 3)) lines.push(`                 ${f}`);
      if (a.authority.length > 3) lines.push(`                 +${a.authority.length - 3} more`);
      if (a.persisted) lines.push(`                 saved: ${a.persisted}`);
      lines.push('');
    }
    console.log(lines.join('\n'));
    return;
  }

  const auth = findAuthority(map, query);
  if (!auth) {
    const known = map.authorities.map((a) => a.id).join(', ');
    fail(`no authority matches '${query}' — known: ${known}`);
  }

  const lines = [...heading(`authority: ${auth.id}`), auth.title, ''];
  if (auth.authority.length) lines.push(...section('source of truth'), ...auth.authority.map((f) => `  ${f}`));
  if (auth.derived?.length) lines.push(...section('derived / wiring (never authoritative)'), ...auth.derived.map((f) => `  ${f}`));
  if (auth.persisted) lines.push(...section('persisted state'), `  ${auth.persisted}`);
  if (auth.mutation?.length) lines.push(...section('mutation points'), ...auth.mutation.map((m) => `  ${m}`));
  if (auth.missingPaths.length) {
    lines.push(...section('MISSING PATHS'), ...auth.missingPaths.map((f) => `  ${f}`));
  }
  if (auth.systemsTouched.length) lines.push(...section('systems'), `  ${auth.systemsTouched.join(', ')}`);
  if (auth.relatedTests.length) {
    lines.push(...section(`related tests (${auth.relatedTests.length})`), ...auth.relatedTests.slice(0, 30).map((t) => `  ${t}`));
    if (auth.relatedTests.length > 30) lines.push(`  … and ${auth.relatedTests.length - 30} more`);
  }
  if (auth.validation) lines.push(...section('validation'), `  ${auth.validation}`);
  if (auth.notes) lines.push(...section('invariants / notes'), `  ${auth.notes}`);
  console.log(lines.join('\n'));
}
