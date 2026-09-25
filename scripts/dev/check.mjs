import { execSync } from 'node:child_process';
import { abs } from './lib/repo.mjs';
import { heading } from './lib/output.mjs';

// ./dev check — aggregate developer gate. Prints exactly what it runs.
// Default = full gate (syntax + full suite). --quick = fast checks only.

const QUICK_STEPS = [
  ['authority map resolves', 'node scripts/dev/cli.mjs authority --check'],
  ['project-map freshness', 'node scripts/dev/cli.mjs map --check'],
  ['save-check', 'node scripts/dev/cli.mjs save-check'],
  ['smoke', 'node scripts/dev/cli.mjs smoke'],
];

const HEAVY_STEPS = [
  ['test:syntax', 'npm run test:syntax'],
  ['full test suite', 'npm test'],
];

export function runCheck(args) {
  const quick = args.includes('--quick') || args.includes('-q');
  const steps = quick ? QUICK_STEPS : [...QUICK_STEPS, ...HEAVY_STEPS];

  console.log(heading(`Blade Vale — check (${quick ? 'quick' : 'full'})`).join('\n'));
  console.log(steps.map((s, i) => `  ${i + 1}. ${s[0]}  →  ${s[1]}`).join('\n') + '\n');

  const failed = [];
  for (const [name, cmd] of steps) {
    process.stdout.write(`\n▶ ${name} … `);
    try {
      execSync(cmd, { cwd: abs('.'), stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
      console.log('OK');
    } catch (e) {
      console.log('FAIL');
      failed.push([name, cmd, (e.stdout ?? '') + (e.stderr ?? '')]);
    }
  }

  console.log('\n' + '='.repeat(50));
  if (failed.length === 0) {
    console.log(`check: all ${steps.length} steps OK`);
    return;
  }
  console.log(`check: ${failed.length}/${steps.length} steps FAILED`);
  for (const [name, cmd, output] of failed) {
    console.log(`\n--- ${name} (${cmd}) ---`);
    console.log(output.split('\n').slice(-25).join('\n'));
  }
  process.exit(1);
}
