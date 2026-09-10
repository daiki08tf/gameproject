import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const styleCss = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

test('UIX-7 phase 2: .screen no longer uses display:none — CSS cannot animate across a display:none boundary', () => {
  assert.doesNotMatch(styleCss, /\.screen\s*\{[^}]*display:\s*none/s);
  assert.match(styleCss, /\.screen\s*\{[^}]*display:\s*flex/s);
});

test('UIX-7 phase 2: inactive screens are hidden via visibility (instant) + pointer-events:none, not opacity alone', () => {
  // visibility:hidden is what makes an inactive screen non-interactive AND
  // excludes it from the tab order/hit-testing — opacity alone would not.
  // No transition is declared on visibility itself, so it flips instantly
  // the moment .active is removed: no cross-fade, no double-exposure with
  // whichever screen becomes active next.
  const screenBlock = styleCss.match(/\.screen\s*\{[^}]*\}/s)?.[0] || '';
  assert.match(screenBlock, /visibility:\s*hidden/);
  assert.match(screenBlock, /pointer-events:\s*none/);
  assert.doesNotMatch(screenBlock, /transition:\s*[^;]*visibility/);
});

test('UIX-7 phase 2: .active applies visibility/pointer-events immediately (not gated behind the animation) so repeated actions are never blocked', () => {
  const activeBlock = styleCss.match(/\.screen\.active\s*\{[^}]*\}/s)?.[0] || '';
  assert.match(activeBlock, /visibility:\s*visible/);
  assert.match(activeBlock, /pointer-events:\s*auto/);
  assert.match(activeBlock, /animation:\s*dc-screen-in/);
});

test('UIX-7 phase 2: the entrance animation uses the existing Dark Chronicle motion tokens, not a new hardcoded duration', () => {
  assert.match(styleCss, /animation:\s*dc-screen-in\s+var\(--dc-motion-base/);
  assert.match(styleCss, /@keyframes dc-screen-in\s*\{/);
  // Fades opacity only — no layout-affecting property, so it can't shift
  // content around or delay a tap landing on the right element.
  const keyframesStart = styleCss.indexOf('@keyframes dc-screen-in');
  const keyframesBlock = styleCss.slice(keyframesStart, keyframesStart + 200);
  assert.match(keyframesBlock, /from\s*\{\s*opacity:\s*0;?\s*\}/);
  assert.match(keyframesBlock, /to\s*\{\s*opacity:\s*1;?\s*\}/);
});

test('UIX-7 phase 2: the reduced-motion override in darkChronicle.css already covers this new animation (no new opt-out needed)', () => {
  const darkChronicle = readFileSync(new URL('../css/darkChronicle.css', import.meta.url), 'utf8');
  // The existing @media (prefers-reduced-motion: reduce) rule targets
  // *, *::before, *::after with animation-duration: .01ms !important —
  // broad enough to already catch dc-screen-in without a dedicated rule.
  assert.match(darkChronicle, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(darkChronicle, /animation-duration: \.01ms !important/);
});
