import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const styleCss = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const toastFeedback = readFileSync(new URL('../js/patches/toastFeedback.js', import.meta.url), 'utf8');
const mainJs = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const blacksmith = readFileSync(new URL('../js/screens/blacksmith.js', import.meta.url), 'utf8');
const rebirthModern = readFileSync(new URL('../js/screens/rebirthModern.js', import.meta.url), 'utf8');

test('UIX-7 phase 3a: Result screen loot chips get a short entrance animation using existing motion tokens', () => {
  const chipBlock = styleCss.slice(styleCss.indexOf('.result-loot-headline,'), styleCss.indexOf('.result-loot-headline,') + 300);
  assert.match(chipBlock, /animation: dc-result-in var\(--dc-motion-base/);
  const keyframesStart = styleCss.indexOf('@keyframes dc-result-in');
  const keyframesBlock = styleCss.slice(keyframesStart, keyframesStart + 200);
  assert.match(keyframesBlock, /opacity:\s*0;\s*transform:\s*translateY\(6px\)/);
  assert.match(keyframesBlock, /opacity:\s*1;\s*transform:\s*translateY\(0\)/);
});

test('UIX-7 phase 3a: jackpot/special drops get a restrained brass border/tint instead of reading with equal weight to a standard drop', () => {
  assert.match(styleCss, /\.result-drop-wrap\.eq3-jackpot \.result-item-chip \{[^}]*border-color: var\(--dc-brass-300\)/s);
  assert.match(styleCss, /\.result-drop-wrap\.eq3-special \.result-item-chip \{[^}]*background: linear-gradient/s);
});

test('UIX-7 phase 3a: showToast() is a shared helper that restarts its animation via a display:none reflow, not a fragile class name it never defines', () => {
  assert.match(toastFeedback, /export function showToast\(text, ms = 2200\)/);
  assert.match(toastFeedback, /classList\.add\('hidden'\)/);
  assert.match(toastFeedback, /void toast\.offsetWidth/);
  assert.match(toastFeedback, /classList\.remove\('hidden'\)/);
  assert.match(toastFeedback, /clearTimeout\(hideTimer\)/);
});

test('UIX-7 phase 3a: main.js\'s Abyss Synergy toast is deduped onto the shared helper (was the only inline toast use in the app)', () => {
  assert.match(mainJs, /import \{ showToast \} from '\.\/patches\/toastFeedback\.js';/);
  assert.match(mainJs, /showToast\(`SYNERGY UNLOCKED — \$\{names\}`\)/);
  assert.doesNotMatch(mainJs, /toast\.classList\.remove\('hidden'\)/);
});

test('UIX-7 phase 3a: three Blacksmith success moments that previously had sound but no visual feedback now show a toast', () => {
  assert.match(blacksmith, /import \{ showToast \} from '\.\.\/patches\/toastFeedback\.js';/);
  assert.match(blacksmith, /state\.awakenWeapon\(id\)\) \{ Audio_\.jobMastered\(\); showToast\(/);
  assert.match(blacksmith, /state\.rollAffix\(id\)\) \{ Audio_\.jobMastered\(\); showToast\(/);
  assert.match(blacksmith, /state\.rollAffix2\(id\)\) \{ Audio_\.jobMastered\(\); showToast\(/);
});

test('UIX-7 phase 3a: two Rebirth success moments (inheritance, awakening claim) that previously had sound but no visual feedback now show a toast', () => {
  assert.match(rebirthModern, /import \{ showToast \} from '\.\.\/patches\/toastFeedback\.js';/);
  assert.match(rebirthModern, /state\.performInheritance\(\); Audio_\.jobMastered\(\); showToast\('継承した！'\);/);
  assert.match(rebirthModern, /state\.claimAwakeningV2\(\)\) \{ Audio_\.jobMastered\(\); showToast\(`覚醒Rank \$\{def\.rank\} 解放！`\);/);
});

test('UIX-7 phase 3a: no new emoji introduced by any of this phase\'s toast/feedback text', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const source of [toastFeedback, mainJs, blacksmith, rebirthModern]) {
    assert.doesNotMatch(source, PICTOGRAPH);
  }
});
