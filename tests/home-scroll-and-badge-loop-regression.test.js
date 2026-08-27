import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const home3Css = fs.readFileSync(new URL('../css/home3.css', import.meta.url), 'utf8');
const smartLootUi = fs.readFileSync(new URL('../js/patches/smartLoot4EquipmentUi.js', import.meta.url), 'utf8');

test('#homeScreen must stay scrollable so an expanded hub panel is always reachable', () => {
  // #homeScreen previously had overflow:hidden. The fixed .ui-primary-nav bar
  // (position:fixed, bottom) then visually and functionally covered whatever
  // hub-panel content didn't fit above it — taps meant for the covered
  // buttons (e.g. 転生の祭壇) silently landed on the nav bar instead, with no
  // way to scroll and reach them. #homeScreen must allow vertical scrolling.
  const rule = home3Css.match(/#homeScreen\s*\{[^}]*\}/)?.[0] || '';
  const declarationsOnly = rule.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(declarationsOnly, /overflow-y\s*:\s*auto/);
  assert.doesNotMatch(declarationsOnly, /overflow\s*:\s*hidden/);
});

test('the Equipment advanced-filter badge must not rewrite its own textContent unconditionally', () => {
  // syncAdvancedBadge() used to assign button.textContent on every call. That
  // assignment is a childList mutation even when the string is unchanged, and
  // this function is invoked from filterObserver (MutationObserver with
  // subtree:true on #lootFilterRow) — so writing it unconditionally retriggers
  // that same observer forever, freezing the tab as soon as the Equipment
  // screen opens. It must only write when the label actually changes, via
  // domSafety.js's setTextIfChanged rather than a raw assignment.
  const fn = smartLootUi.match(/function syncAdvancedBadge[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(fn, 'syncAdvancedBadge function not found');
  assert.doesNotMatch(fn, /^\s*button\.textContent\s*=/m);
  assert.match(fn, /setTextIfChanged\(button,\s*\w+\)/);
  assert.match(smartLootUi, /import\s*\{[^}]*setTextIfChanged[^}]*\}\s*from\s*'\.\/domSafety\.js'/);
});
