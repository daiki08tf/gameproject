import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const chapterSelect = readFileSync(new URL('../js/screens/chapterSelect.js', import.meta.url), 'utf8');
const stageSelect = readFileSync(new URL('../js/screens/stageSelect.js', import.meta.url), 'utf8');
const stageFirstNav = readFileSync(new URL('../js/patches/stageFirstNavigationUi.js', import.meta.url), 'utf8');
const clr17LootUi = readFileSync(new URL('../js/patches/coreLoopClr17LootIdentityUi.js', import.meta.url), 'utf8');
const styleCss = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-3 removes rendered-UI emoji from the Chapter/Stage/Story-Hunt surfaces', () => {
  for (const [name, source] of [
    ['js/screens/chapterSelect.js', chapterSelect],
    ['js/screens/stageSelect.js', stageSelect],
    ['js/patches/stageFirstNavigationUi.js', stageFirstNav],
    ['js/patches/coreLoopClr17LootIdentityUi.js', clr17LootUi],
  ]) {
    assert.doesNotMatch(source, PICTOGRAPH, `${name} must not render platform emoji`);
  }
});

test('UIX-3 keeps Stage IDs and NEXT/CLEAR/LOCKED/BOSS states explicit as text, not icon-only', () => {
  assert.match(stageFirstNav, /return 'CLEAR'/);
  assert.match(stageFirstNav, /return 'NEXT'/);
  assert.match(stageFirstNav, /return 'OPEN'/);
  assert.match(stageFirstNav, /\$\{stage\.id\} \?\?\?/);
  assert.match(stageSelect, /'CLEAR'/);
  assert.match(stageSelect, /'LOCKED'/);
  assert.match(stageSelect, /'BOSS'/);
  assert.match(chapterSelect, /'LOCKED'/);
  assert.match(chapterSelect, /'CLEAR'/);
});

test('UIX-3 stops rendering data-owned presentation icon fields on World-layer nodes and Abyss routes', () => {
  assert.doesNotMatch(chapterSelect, /node\.icon/);
  assert.doesNotMatch(stageSelect, /stage\.abyssRoute\.icon/);
  // Presentation metadata; consumer migration only. The data field itself
  // is untouched pending an evidence-based cleanup pass (UI_DESIGN_SYSTEM.md).
  assert.match(chapterSelect, /node\.badge/);
});

test('UIX-3 gives Stage/Chapter cards and section headings Dark Chronicle tokens instead of bare rgba colors', () => {
  assert.match(styleCss, /\.stage-card \{[^}]*var\(--dc-ink-800/s);
  assert.match(styleCss, /\.stage-card\.boss \{[^}]*var\(--dc-danger-500/s);
  assert.match(styleCss, /\.stage-card\.branch \{[^}]*var\(--dc-observe-400/s);
  assert.match(styleCss, /\.stage-card \.cleared \{[^}]*var\(--dc-brass-300/s);
  assert.match(styleCss, /\.section-heading \{[^}]*var\(--dc-ash-300/s);
  assert.match(styleCss, /\.world3-badge \{/);
  assert.match(styleCss, /\.clr17-loot-identity \{/);
});

test('UIX-3 does not touch Story/Adventure/Hunt authority — presentation only', () => {
  for (const source of [chapterSelect, stageSelect, stageFirstNav, clr17LootUi]) {
    assert.doesNotMatch(source, /localStorage/);
  }
  assert.match(stageFirstNav, /state\.isStageCleared\(stage\.id\)/);
  assert.match(stageFirstNav, /stageFirstHuntContext/);
});
