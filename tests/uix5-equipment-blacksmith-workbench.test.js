import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const equipment = readFileSync(new URL('../js/screens/equipment.js', import.meta.url), 'utf8');
const equipment4 = readFileSync(new URL('../js/screens/equipment4.js', import.meta.url), 'utf8');
const equipmentFusion = readFileSync(new URL('../js/screens/equipmentFusion.js', import.meta.url), 'utf8');
const blacksmith = readFileSync(new URL('../js/screens/blacksmith.js', import.meta.url), 'utf8');
const weaponCodex = readFileSync(new URL('../js/screens/weaponCodex.js', import.meta.url), 'utf8');
const buildLoadouts = readFileSync(new URL('../js/patches/buildLoadoutsUi.js', import.meta.url), 'utf8');
const equipmentCompactUi = readFileSync(new URL('../js/patches/equipmentCompactUi.js', import.meta.url), 'utf8');
const smartLoot4Ui = readFileSync(new URL('../js/patches/smartLoot4EquipmentUi.js', import.meta.url), 'utf8');
const craftingConsolidation = readFileSync(new URL('../js/patches/gearOverhaulCraftingConsolidation.js', import.meta.url), 'utf8');
const equipment3Blacksmith = readFileSync(new URL('../js/patches/equipment3Blacksmith.js', import.meta.url), 'utf8');
const styleCss = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const equipment4Css = readFileSync(new URL('../css/equipment4.css', import.meta.url), 'utf8');

const PICTOGRAPH = /\p{Extended_Pictographic}/u;
const ALL_SOURCES = {
  'js/screens/equipment.js': equipment,
  'js/screens/equipment4.js': equipment4,
  'js/screens/equipmentFusion.js': equipmentFusion,
  'js/screens/blacksmith.js': blacksmith,
  'js/screens/weaponCodex.js': weaponCodex,
  'js/patches/buildLoadoutsUi.js': buildLoadouts,
  'js/patches/equipmentCompactUi.js': equipmentCompactUi,
  'js/patches/smartLoot4EquipmentUi.js': smartLoot4Ui,
  'js/patches/gearOverhaulCraftingConsolidation.js': craftingConsolidation,
  'js/patches/equipment3Blacksmith.js': equipment3Blacksmith,
};

test('UIX-5 removes rendered-UI emoji from the Equipment/Blacksmith/Codex workbench', () => {
  for (const [name, source] of Object.entries(ALL_SOURCES)) {
    assert.doesNotMatch(source, PICTOGRAPH, `${name} must not render platform emoji`);
  }
});

test('UIX-5 replaces Gold/manastone/lock glyph prefixes with the codebase\'s existing plain-text convention', () => {
  // settlementMarketUi.js / rune2ObserveUi.js / endgameGuidanceUi.js already
  // spell Gold out as plain text; blacksmith.js already spelled 魔石 out
  // (line 25) before this phase touched the cost strings below it.
  assert.match(blacksmith, /Gold\$\{cost\}/);
  assert.match(blacksmith, /魔石\$\{cost\}/);
  assert.match(blacksmith, /Gold\$\{sellGold\}/);
  assert.match(equipment3Blacksmith, /Gold\$\{cost\.gold\}/);
  assert.match(equipment3Blacksmith, /魔石\$\{cost\.manastone\}/);
  assert.doesNotMatch(equipment, / 🔒/);
  assert.match(equipment, /\[LOCK\]/);
});

test('UIX-5 keeps the element label consistent (kanji only, no per-element emoji) across Equipment and the weapon Codex', () => {
  assert.match(equipment, /fire: '炎', ice: '氷', lightning: '雷', wind: '風'/);
  assert.match(weaponCodex, /fire: '炎', ice: '氷', lightning: '雷', wind: '風'/);
});

test('UIX-5 keeps the "詳細" advanced-filter toggle text in sync between equipment.js and its Smart Loot 4 decorator', () => {
  assert.match(equipment, /`詳細\$\{activeAdvanced/);
  assert.match(smartLoot4Ui, /startsWith\('詳細'\)/);
  assert.match(smartLoot4Ui, /`詳細\$\{total/);
});

test('UIX-5 gives Equipment/Blacksmith surfaces Dark Chronicle tokens instead of bare rgba colors', () => {
  assert.match(styleCss, /\.equip-slot \{[^}]*var\(--dc-ink-800/s);
  assert.match(styleCss, /\.pick-row \{[^}]*var\(--dc-ink-800/s);
  assert.match(styleCss, /\.pick-row\.equipped \{[^}]*var\(--dc-brass-500/s);
  assert.match(styleCss, /\.forge-card \{[^}]*var\(--dc-ink-800/s);
  assert.match(styleCss, /\.forge-card-btn \{[^}]*var\(--dc-brass-300/s);
  assert.match(styleCss, /\.rune-slot\.filled \{[^}]*var\(--dc-brass-500/s);
  assert.match(styleCss, /\.stat-up \{[^}]*var\(--dc-success-400/s);
  assert.match(styleCss, /\.stat-down \{[^}]*var\(--dc-danger-300/s);
  assert.match(equipment4Css, /var\(--dc-brass-500/);
  assert.match(equipment4Css, /var\(--dc-observe-400/);
  assert.match(smartLoot4Ui, /var\(--dc-brass-300/);
});

test('UIX-5 introduces no new calculation authority — reads existing state and calls existing mutators only', () => {
  for (const [name, source] of Object.entries(ALL_SOURCES)) {
    assert.doesNotMatch(source, /localStorage/, `${name} must not touch localStorage directly`);
  }
  // The comparison/scoring path still reads the existing powerScore/equipmentPowerScore
  // authority rather than computing its own score.
  assert.match(equipment, /state\.equipmentPowerScore/);
  assert.match(equipment, /powerScore\(/);
  assert.match(equipment4, /state\.equipmentPowerScore/);
  // Option Fusion math stays in js/data/options4Fusion.js; the UI only reads it.
  assert.match(equipmentFusion, /import \{ optionXpToNext, optionMilestoneState, optionXpBetween \} from '\.\.\/data\/options4Fusion\.js'/);
  assert.match(equipment4, /import \{ optionXpToNext \} from '\.\.\/data\/options4Fusion\.js'/);
});

test('UIX-5 keeps destructive actions (dispose/sell/dismantle, Option Fusion material consumption) explicit and protected', () => {
  assert.match(blacksmith, /locked = state\.isItemLocked\(id\)/);
  assert.match(blacksmith, /sellBtn\.disabled = locked/);
  assert.match(blacksmith, /dismantleBtn\.disabled = locked/);
  assert.match(blacksmith, /ロック中は売却・分解できません/);
  assert.match(equipmentFusion, /globalThis\.confirm/);
});

test('UIX-5 preserves the compact-detail MutationObserver idempotency contract (Equipment 4 / Option Fusion decorators)', () => {
  assert.match(equipment4, /if \(decorating\) return;/);
  assert.match(equipmentFusion, /if \(decorating\) return;/);
  assert.match(equipmentCompactUi, /addClassIfMissing/);
  assert.match(craftingConsolidation, /setTextIfChanged/);
  assert.match(smartLoot4Ui, /setTextIfChanged/);
});
