import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const equipmentCompactCss = fs.readFileSync('css/equipmentCompact.css', 'utf8');
const equipment4Css = fs.readFileSync('css/equipment4.css', 'utf8');
const equipmentFusion = fs.readFileSync('js/screens/equipmentFusion.js', 'utf8');

// Bug report: from the Equipment screen, expanding a weapon's "性能・Affix・
// 固有効果" disclosure (equipmentCompactUi.js's compact-detail-body) revealed
// nothing — the underlying stat/Affix text never appeared even though the
// disclosure toggled open. Root cause: equipment4.css's older, more specific
// "Phase 4B" compact-row rule (display:none on .item-stats/.eq3-meta/
// .affix-block/.eq3-special-line/.compare-line for any .equipment4-compact-row)
// predates the disclosure and silently wins the cascade, permanently hiding
// this content even once it is moved inside .equip-compact-detail-body.

test('equipment4.css keeps its scanning-list hide rule for the plain compact-row case', () => {
  // The original Phase 4B behavior (hide by default in the bare list) must
  // still exist — this fix only adds a visibility exception for content
  // that has actually been moved inside the compact-detail disclosure body.
  assert.match(equipment4Css, /\.equipment4-compact-row \.item-stats:not\(\.equipment4-keep-lock-reason\),\s*\n#equipmentScreen \.equip-picker > \.equipment4-compact-row \.eq3-meta,/);
  assert.match(equipment4Css, /display:\s*none;/);
});

test('equipmentCompact.css restores visibility for compact-detail-body content and the kept-visible comparison line', () => {
  const block = equipmentCompactCss.slice(equipmentCompactCss.indexOf('equipment4.css'), equipmentCompactCss.indexOf('#equipmentScreen .equip-paperdoll-compact'));
  assert.match(block, /\.equip-compact-detail-body \.item-stats,/);
  assert.match(block, /\.equip-compact-detail-body \.eq3-meta,/);
  assert.match(block, /\.equip-compact-detail-body \.affix-block,/);
  assert.match(block, /\.equip-compact-detail-body \.eq3-special-line,/);
  assert.match(block, /\.compare-line\.equip-compact-compare\{/);
  assert.match(block, /display:block;/);
  // .affix-block's own stacked .affix-line children still need their column
  // layout restored, not just block-level visibility.
  assert.match(block, /\.equip-compact-detail-body \.affix-block\{\s*display:flex;\s*flex-direction:column;/);
});

test('Option Fusion\'s injected controls get an explicit full-row grid placement under the compact-card grid layout', () => {
  assert.match(equipmentCompactCss, /#equipmentScreen \.equip-compact-card > \.option-fusion-actions,\s*\n#equipmentScreen \.equip-compact-card > \.option-fusion-panel\{\s*grid-column:1 \/ -1;/);
});

test('equipmentFusion.js no longer forces align-items:stretch on the row (the direct cause of the near-viewport-height blank space)', () => {
  assert.doesNotMatch(equipmentFusion, /row\.style\.alignItems\s*=\s*'stretch'/);
  // The full-width intent for .pick-main stays expressed via flex-basis/width,
  // which was never the actual bug — only the stretch line was.
  assert.match(equipmentFusion, /main\.style\.flex = '1 0 100%'/);
  assert.match(equipmentFusion, /main\.style\.width = '100%'/);
});
