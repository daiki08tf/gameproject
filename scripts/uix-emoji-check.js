import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['index.html', 'js', 'css'];
const SOURCE_EXTENSION = /\.(?:html|js|css)$/;
const PICTOGRAPH = /\p{Extended_Pictographic}/gu;
const SHELL_MARKERS = /homeGoldText|abyssShardText|manastoneText|menu-icon|weaponCodexBtn|autoEquipBtn|home-hero|phase14-next|phase14-home-summary|endgame-guide/;
const MAX_APP_PICTOGRAPHS = 425;

function collect(target, output = []) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target).sort()) collect(path.join(target, entry), output);
  } else if (SOURCE_EXTENSION.test(target)) {
    output.push(target);
  }
  return output;
}

const files = ROOTS.flatMap((root) => collect(root));
let total = 0;
const violations = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const count = (source.match(PICTOGRAPH) || []).length;
  total += count;
  if (file === 'index.html' && count) violations.push(`${file}: ${count} pictograph(s) in the initial shell`);
  source.split('\n').forEach((line, index) => {
    if (SHELL_MARKERS.test(line) && PICTOGRAPH.test(line)) {
      violations.push(`${file}:${index + 1}: pictograph in shared shell UI`);
    }
    PICTOGRAPH.lastIndex = 0;
  });
}

if (total > MAX_APP_PICTOGRAPHS) {
  violations.push(`application total ${total} exceeds migration ceiling ${MAX_APP_PICTOGRAPHS}`);
}

if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`UIX emoji gate: shared shell clean; application migration ceiling ${total}/${MAX_APP_PICTOGRAPHS}`);
}
