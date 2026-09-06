import assert from 'assert';
import { readFileSync } from 'fs';

const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const cleanupSource = readFileSync(new URL('../js/patches/systemCleanupAwakeningV2.js', import.meta.url), 'utf8');
const runeUiSource = readFileSync(new URL('../js/patches/rune2Ui.js', import.meta.url), 'utf8');
const blacksmithSource = readFileSync(new URL('../js/screens/blacksmith.js', import.meta.url), 'utf8');

assert.match(
  indexSource,
  /<button class="tab-btn" data-tab="rune">ルーン<\/button>/,
  'blacksmith must expose the Rune tab used by Rune 2.0',
);
assert.doesNotMatch(
  cleanupSource,
  /querySelector\(['"]#blacksmithScreen \[data-tab=["']rune["']\]["']\)[\s\S]*?\.remove\(\)/,
  'system cleanup must retire legacy Rune behavior without removing the Rune 2.0 entry tab',
);
// Previously Rune 2.0 UI self-attached a setTimeout(renderRune2Dashboard, 0)
// click listener on the same tab button blacksmith.js's own listener used to
// render the (now fully retired) socket/craft UI into — a race that could
// lose on a slow device, leaving dead buttons on screen. blacksmith.js's own
// tab dispatch now calls renderRune2Dashboard() directly and synchronously,
// so there is no longer a second listener or a race to win.
assert.match(
  blacksmithSource,
  /import \{ renderRune2Dashboard \} from '\.\.\/patches\/rune2Ui\.js';/,
  'blacksmith must import the Rune 2.0 dashboard renderer directly',
);
assert.match(
  blacksmithSource,
  /activeTab === 'rune'\) renderRune2Dashboard\(\);/,
  'the blacksmith Rune tab must dispatch straight to the Rune 2.0 dashboard, not a legacy renderer',
);
assert.doesNotMatch(
  runeUiSource,
  /querySelectorAll\(['"]#blacksmithScreen \.tab-btn\[data-tab=["']rune["']\]["']\)/,
  'Rune 2.0 UI must not race a legacy renderer via its own tab click listener anymore',
);
assert.match(
  runeUiSource,
  /所持総数 \$\{totalOwned\.toLocaleString\(\)\}/,
  'Rune 2.0 dashboard must show aggregate owned marks once the tab is opened',
);

console.log('Rune 2.0 blacksmith entry tests passed');
