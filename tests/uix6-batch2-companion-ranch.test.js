import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const companionFoundation = readFileSync(new URL('../js/patches/companionFoundation.js', import.meta.url), 'utf8');
const monsterRanchUi = readFileSync(new URL('../js/patches/monsterRanchUi.js', import.meta.url), 'utf8');
const monsterRanch2FacilitiesUi = readFileSync(new URL('../js/patches/monsterRanch2FacilitiesUi.js', import.meta.url), 'utf8');
const companionRecruitment = readFileSync(new URL('../js/patches/companionRecruitment.js', import.meta.url), 'utf8');
const companion3Breeding = readFileSync(new URL('../js/patches/companion3Breeding.js', import.meta.url), 'utf8');
const companionBattle = readFileSync(new URL('../js/patches/companionBattle.js', import.meta.url), 'utf8');
const monsterRanchCompactCss = readFileSync(new URL('../css/monsterRanchCompact.css', import.meta.url), 'utf8');
const companionsData = readFileSync(new URL('../js/data/companions.js', import.meta.url), 'utf8');

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-6 batch 2 removes rendered-UI emoji from Companion, Monster Ranch and the Battle-screen companion HUD', () => {
  for (const [name, source] of [
    ['js/patches/companionFoundation.js', companionFoundation],
    ['js/patches/monsterRanchUi.js', monsterRanchUi],
    ['js/patches/monsterRanch2FacilitiesUi.js', monsterRanch2FacilitiesUi],
    ['js/patches/companionRecruitment.js', companionRecruitment],
    ['js/patches/companion3Breeding.js', companion3Breeding],
    ['js/patches/companionBattle.js', companionBattle],
  ]) {
    assert.doesNotMatch(source, PICTOGRAPH, `${name} must not render platform emoji`);
  }
});

test('UIX-6 batch 2 stops rendering species/evolution icon fields without touching the canonical data', () => {
  // Point-of-render fix: species.icon is presentation metadata on the
  // canonical companion data object (category 2 per the UIX-0 migration
  // decision framework) — stop rendering it, leave the data field itself
  // untouched for later evidence-based cleanup.
  assert.doesNotMatch(companionFoundation, /species\.icon/);
  assert.doesNotMatch(monsterRanchUi, /species\.icon/);
  // The canonical data file keeps its icon fields (e.g. the slime's) —
  // confirms this was a render-side fix, not a data-file edit.
  assert.match(companionsData, /icon:'🔵'/);
});

test('UIX-6 batch 2 drops the decorative recruit-prompt icon instead of replacing it with another glyph', () => {
  // The Battle-screen recruit overlay's icon (flagged in UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md
  // §10/§11 as this batch's debt) was pure decoration — the candidate name
  // already renders as the next element — so it is removed, not reglyphed.
  assert.doesNotMatch(companionRecruitment, /candidate\.icon/);
  assert.doesNotMatch(companionRecruitment, /icon:species\.icon/);
});

test('UIX-6 batch 2 replaces bare glyph markers and decorative prefixes with text/non-pictographic symbols', () => {
  assert.match(monsterRanchUi, /mark=current\?\.id===x\.id\?' → 現在'/);
  assert.match(companionBattle, /シナジー: /);
  assert.match(companionBattle, /仲間\$\{i\+1\}/);
  assert.match(monsterRanch2FacilitiesUi, /forge-card-name">孵化場</);
  assert.match(monsterRanch2FacilitiesUi, /forge-card-name">配合卵</);
  assert.match(companion3Breeding, /forge-card-name">配合</);
});

test('UIX-6 batch 2 gives the Monster Ranch compact tabs/search Dark Chronicle tokens instead of bare --ui-* aliases', () => {
  assert.match(monsterRanchCompactCss, /\.ranch-compact-tab\{[^}]*var\(--dc-iron-500/);
  assert.match(monsterRanchCompactCss, /\.ranch-compact-tab\.active\{[^}]*var\(--dc-brass-300/);
  assert.match(monsterRanchCompactCss, /\.ranch-compact-search\{[^}]*var\(--dc-ink-800/);
});

test('UIX-6 batch 2 introduces no new calculation authority — Companion/Ranch read and mutate existing companion state only', () => {
  for (const source of [companionFoundation, monsterRanchUi, monsterRanch2FacilitiesUi, companionRecruitment, companion3Breeding, companionBattle]) {
    assert.doesNotMatch(source, /localStorage/);
  }
  assert.match(companionFoundation, /state\.companionList\(\)/);
  assert.match(monsterRanchUi, /state\.ranchCompanionInfo/);
});
