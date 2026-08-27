import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// This session repeatedly hit the same bug class across many patch files:
// a function decorates a DOM node by unconditionally rewriting textContent /
// innerHTML / classList / appendChild, and that same function is invoked from
// a MutationObserver that watches the very node (or subtree) it rewrites.
// classList.add()/textContent=/appendChild() all re-queue a mutation record
// even when the resulting value is identical to what was already there, so
// the unconditional version retriggers its own observer forever — freezing
// or crashing the tab, sometimes before the title screen even renders.
//
// Each fix below locks in the specific guard that breaks the loop. Most now
// route through the shared js/patches/domSafety.js helpers (setTextIfChanged,
// addClassIfMissing, appendIfDetached, ensureInserted) instead of a bespoke
// inline guard, so new patch files have a ready-made safe primitive instead
// of reinventing one. See docs/MUTATION_OBSERVER_SAFETY.md for the full
// pattern writeup.

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

function importsFromDomSafety(src, helperName) {
  return new RegExp(`import\\s*\\{[^}]*\\b${helperName}\\b[^}]*\\}\\s*from\\s*'\\.\\/domSafety\\.js'`).test(src);
}

test('monsterRanch2CompleteUi.js: observer only reinserts the panel when missing', () => {
  const src = read('js/patches/monsterRanch2CompleteUi.js');
  assert.doesNotMatch(src, /observe\(root,\{childList:true\}\)\);\}queueMicrotask\(render\);\s*$/);
  assert.ok(importsFromDomSafety(src, 'ensureInserted'), 'must import ensureInserted from domSafety.js');
  assert.match(src, /ensureInserted\(\(\)=>document\.getElementById\('ranch2Advanced'\),render\)/);
});

test('equipmentCompactUi.js: classList.add() is only called when the class is actually missing', () => {
  const src = read('js/patches/equipmentCompactUi.js');
  assert.ok(importsFromDomSafety(src, 'addClassIfMissing'), 'must import addClassIfMissing from domSafety.js');
  assert.match(src, /addClassIfMissing\(picker, 'ui-list-compact', 'equip-picker-compact'\)/);
  assert.match(src, /addClassIfMissing\(filters, 'equip-filter-compact'\)/);
  assert.match(src, /addClassIfMissing\(doll, 'equip-paperdoll-compact'\)/);
});

test('monsterRanchCompactUi.js: foldBondIntoDetails only moves the node when it is not already in place', () => {
  const src = read('js/patches/monsterRanchCompactUi.js');
  assert.ok(importsFromDomSafety(src, 'appendIfDetached'), 'must import appendIfDetached from domSafety.js');
  assert.match(src, /if\(bond&&body\) appendIfDetached\(body,bond\);/);
});

test('contentPackIIE.js: lore fragment block only rebuilds when the fragment count changed', () => {
  const src = read('js/patches/contentPackIIE.js');
  assert.match(src, /existingLore&&Number\(existingLore\.dataset\.cp2eLoreCount\)===lore\.length\)return;/);
});

test('inheritanceBalanceUi.js: gate button textContent is only written when the label changed', () => {
  const src = read('js/patches/inheritanceBalanceUi.js');
  assert.ok(importsFromDomSafety(src, 'setTextIfChanged'), 'must import setTextIfChanged from domSafety.js');
  assert.match(src, /setTextIfChanged\(btn,label\);/);
});

test('gearOverhaulCraftingConsolidation.js: crafting button labels are only written when changed', () => {
  const src = read('js/patches/gearOverhaulCraftingConsolidation.js');
  assert.ok(importsFromDomSafety(src, 'setTextIfChanged'), 'must import setTextIfChanged from domSafety.js');
  assert.match(src, /setTextIfChanged\(button, label\);/);
  assert.match(src, /setTextIfChanged\(button, 'Option再抽選'\);/);
});
