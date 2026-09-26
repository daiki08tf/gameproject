#!/usr/bin/env node
// Blade Vale dev front door. Zero-dependency; plain node + ESM.
import { runDoctor } from './doctor.mjs';
import { runStatus } from './status.mjs';
import { runMap } from './map.mjs';
import { runAuthority } from './authority.mjs';
import { runImpact } from './impact.mjs';
import { runScope } from './scope.mjs';
import { runContext } from './context.mjs';
import { runHandoff } from './handoff.mjs';
import { runSaveCheck } from './saveCheck.mjs';
import { runSmoke } from './smoke.mjs';
import { runCheck } from './check.mjs';
import { runPlay } from './play.mjs';
import { runRemote } from './remote.mjs';

const USAGE = `Blade Vale dev front door

usage: ./dev <command> [args]

orientation
  help                 this message
  doctor               environment + repo health (fail/warn)
  status               short dev state (branch, dirty, counts, save)
  map [--write|--check] system map from .dev/systems.json (generated, deterministic)

authority
  authority [id]       authority map; <id> for detail; --check verifies paths
  impact <t>           blast radius of a path / system / authority
  scope [t]            likely-in-scope files (+ current diff when run bare)
  context <t>          agent-ready context packet for a system/concept
  handoff [t]          handoff packet (working tree, or focused on <t>)

play
  play                 launch a local server + browser — THE way to run the game
  remote <sub>         tailnet-only iPhone access: start|stop|restart|status|url

validation
  save-check           save schema + c1 job migration + migration tests
  smoke                fast sanity (imports, schema, curated subset)
  check [--quick]      aggregate gate (default adds syntax + full suite)

targets <t> accept: system id (jobs, adventure4, equipment…), concept
(adventure, save, rune…), authority id (save, combat, loot…), or a path.
`;

const COMMANDS = {
  help: () => console.log(USAGE),
  doctor: runDoctor,
  status: runStatus,
  map: runMap,
  authority: runAuthority,
  impact: runImpact,
  scope: runScope,
  context: runContext,
  handoff: runHandoff,
  'save-check': runSaveCheck,
  smoke: runSmoke,
  check: runCheck,
  play: runPlay,
  remote: runRemote,
};

const [cmd, ...args] = process.argv.slice(2);

if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
  console.log(USAGE);
  process.exit(0);
}

const fn = COMMANDS[cmd];
if (!fn) {
  console.error(`unknown command '${cmd}'\n`);
  console.log(USAGE);
  process.exit(1);
}

try {
  await fn(args);
} catch (e) {
  console.error(`dev ${cmd} failed: ${e.message}`);
  if (process.env.DEV_DEBUG) console.error(e.stack);
  process.exit(1);
}
