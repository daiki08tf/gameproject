import assert from 'assert';
import { readFileSync } from 'fs';

const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const cleanupSource = readFileSync(new URL('../js/patches/systemCleanupAwakeningV2.js', import.meta.url), 'utf8');
const runeUiSource = readFileSync(new URL('../js/patches/rune2Ui.js', import.meta.url), 'utf8');

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
assert.match(
  runeUiSource,
  /querySelectorAll\(['"]#blacksmithScreen \.tab-btn\[data-tab=["']rune["']\]["']\)/,
  'Rune 2.0 UI must remain wired to the blacksmith Rune tab',
);
assert.match(
  runeUiSource,
  /所持総数 \$\{totalOwned\.toLocaleString\(\)\}/,
  'Rune 2.0 dashboard must show aggregate owned marks once the tab is opened',
);

console.log('Rune 2.0 blacksmith entry tests passed');
