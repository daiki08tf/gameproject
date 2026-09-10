import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Regression coverage for a real bug: the Blacksmith "rune" tab used to render
// the retired weapon-socket UI (renderRuneTab/renderCraftSection, wired to
// state.craftRune/socketRune/unsocketRune — all permanently stubbed no-ops in
// systemCleanupAwakeningV2.js) and relied on rune2Ui.js separately attaching a
// setTimeout(renderRune2Dashboard, 0) click listener on the same tab button to
// race-overwrite it afterward. On slower devices/engines this race could lose,
// leaving the player looking at dead buttons that silently do nothing when
// clicked ("鍛冶屋でのボタンを押した時の挙動明らかにおかしい"). The fix routes
// the "rune" tab straight to the real Rune 2.0 dashboard, synchronously, with
// no competing renderer and no timing dependency.

const blacksmith = fs.readFileSync(new URL('../js/screens/blacksmith.js', import.meta.url), 'utf8');
const rune2Ui = fs.readFileSync(new URL('../js/patches/rune2Ui.js', import.meta.url), 'utf8');

test('Blacksmith "rune" tab dispatches straight to the Rune 2.0 dashboard, not the retired socket UI', () => {
  assert.match(blacksmith, /import \{ renderRune2Dashboard \} from '\.\.\/patches\/rune2Ui\.js';/);
  assert.match(blacksmith, /activeTab === 'rune'\) renderRune2Dashboard\(\);/);
  assert.doesNotMatch(blacksmith, /function renderRuneTab/);
  assert.doesNotMatch(blacksmith, /function renderCraftSection/);
});

test('Blacksmith no longer references the retired weapon-socket rune API or old rune item data', () => {
  assert.doesNotMatch(blacksmith, /state\.craftRune\(/);
  assert.doesNotMatch(blacksmith, /state\.socketRune\(/);
  assert.doesNotMatch(blacksmith, /state\.unsocketRune\(/);
  assert.doesNotMatch(blacksmith, /state\.getRuneSockets\(/);
  assert.doesNotMatch(blacksmith, /from '\.\.\/data\/runes\.js'/);
  assert.doesNotMatch(blacksmith, /selectedRuneSlot/);
});

test('rune2Ui.js no longer races a legacy renderer via setTimeout on the rune tab button', () => {
  assert.doesNotMatch(rune2Ui, /querySelectorAll\('#blacksmithScreen \.tab-btn\[data-tab="rune"\]'\)/);
  assert.match(rune2Ui, /export \{ renderRune2Dashboard \};/);
});
