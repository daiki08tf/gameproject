import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SPECIES_GRADE_THRESHOLDS, speciesGrade, speciesGradeProgress, speciesGradeTraitMult, SPECIES_GRADE_TRAIT_MULT, RANCH_RESEARCH_MILESTONES } from '../js/data/monsterRanch.js';
import { COMPANION_RARITY, COMPANION_RARITY_LABEL } from '../js/data/companions.js';
import { state } from '../js/state.js';
// Deliberately NOT importing companionFoundation.js: it installs DOM UI
// unconditionally at module top-level (no `typeof document` guard, unlike
// the C4/C5 patch files), so it cannot be imported under plain Node. Every
// function this test needs (ranchResearch/recordRanchRecruit/
// ranchSpeciesGrade) lives in monsterRanchCore.js/ranchSpeciesGrade.js,
// neither of which touches companionInstances or the DOM at all -- see the
// "stays a display layer" test below, which proves that separation
// structurally instead of by creating a real companion instance.
import '../js/patches/monsterRanchCore.js';
import '../js/patches/ranchSpeciesGrade.js';

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

test('C6-4: species grade thresholds reuse the existing research milestone counts (3/20/50/100), not invented numbers, and exactly match COMPANION_RARITY', () => {
  assert.deepEqual(SPECIES_GRADE_THRESHOLDS.map((t) => t.grade), COMPANION_RARITY);
  const milestoneCounts = new Set(RANCH_RESEARCH_MILESTONES.map((m) => m.count));
  for (const t of SPECIES_GRADE_THRESHOLDS) {
    if (t.count === 0) continue; // 'normal' has no milestone of its own -- it's the starting grade
    assert.ok(milestoneCounts.has(t.count), `grade "${t.grade}"'s threshold (${t.count}) should line up with an existing research milestone`);
  }
});

test('speciesGrade is a pure, monotonic step function of recruited count', () => {
  assert.equal(speciesGrade(0), 'normal');
  assert.equal(speciesGrade(2), 'normal');
  assert.equal(speciesGrade(3), 'rare');
  assert.equal(speciesGrade(19), 'rare');
  assert.equal(speciesGrade(20), 'epic');
  assert.equal(speciesGrade(49), 'epic');
  assert.equal(speciesGrade(50), 'legendary');
  assert.equal(speciesGrade(99), 'legendary');
  assert.equal(speciesGrade(100), 'mythic');
  assert.equal(speciesGrade(99999), 'mythic'); // never a new tier past mythic -- no uncapped ladder
});

test('speciesGradeProgress reports the current grade, the next grade, and exactly how many more recruits are needed', () => {
  assert.deepEqual(speciesGradeProgress(0), { grade: 'normal', next: 'rare', nextCount: 3, recruited: 0 });
  assert.deepEqual(speciesGradeProgress(1), { grade: 'normal', next: 'rare', nextCount: 3, recruited: 1 });
  assert.deepEqual(speciesGradeProgress(20), { grade: 'epic', next: 'legendary', nextCount: 50, recruited: 20 });
  const capped = speciesGradeProgress(100);
  assert.equal(capped.grade, 'mythic');
  assert.equal(capped.next, null);
  assert.equal(capped.nextCount, null);
});

test('Runtime: state.ranchSpeciesGrade() derives from the real ranchResearch recruited counter and needs no migration (a fresh save computes it correctly with zero setup)', () => {
  state.resetAll();
  const speciesId = 'goblin';
  let grade = state.ranchSpeciesGrade(speciesId);
  assert.equal(grade.grade, 'normal');
  assert.equal(grade.label, COMPANION_RARITY_LABEL.normal);
  assert.equal(grade.remaining, 3);

  for (let i = 0; i < 3; i++) state.recordRanchRecruit(speciesId);
  grade = state.ranchSpeciesGrade(speciesId);
  assert.equal(grade.grade, 'rare');
  assert.equal(grade.nextLabel, COMPANION_RARITY_LABEL.epic);
});

test('ranchSpeciesGrade.js stays a display layer, structurally separate from individual instance rarity -- it never reads companionInstances or .rarity', () => {
  const src = fs.readFileSync(new URL('../js/patches/ranchSpeciesGrade.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /companionInstances/);
  assert.doesNotMatch(src, /\.rarity\b/);
  assert.doesNotMatch(src, /createCompanion/);
});

test('state.recordRanchRecruit() reports gradedUp only on the exact call that crosses a threshold', () => {
  state.resetAll();
  const speciesId = 'bat';
  let last = null;
  for (let i = 0; i < 3; i++) last = state.recordRanchRecruit(speciesId);
  assert.equal(last.gradedUp, 'rare');
  assert.equal(last.gradedUpLabel, COMPANION_RARITY_LABEL.rare);
  const notGraded = state.recordRanchRecruit(speciesId);
  assert.equal(notGraded.gradedUp, undefined);
});

test('companionRecruitment.js combines a grade-up into the same toast as the recruit announcement instead of firing two back-to-back toasts', () => {
  const text = read('js/patches/companionRecruitment.js');
  assert.match(text, /gradedUpLabel/);
  assert.match(text, /に昇格/);
  // Only one showToast call in the accept path -- confirms no second,
  // colliding toast call was added for the grade-up case.
  const acceptedBranch = text.slice(text.indexOf('function announceRecruit'));
  const toastCalls = acceptedBranch.match(/showToast\(/g) || [];
  assert.ok(toastCalls.length <= 2, 'announceRecruit should have at most one showToast call per branch (accepted / full)');
});

test('Egg hatching also reports a grade-up (same recordRanchRecruit path as battle recruitment)', () => {
  const facilities = read('js/patches/monsterRanch2Facilities.js');
  assert.match(facilities, /gradedUpLabel:recruitRecord\?\.gradedUp\?recruitRecord\.gradedUpLabel:null/);
  const facilitiesUi = read('js/patches/monsterRanch2FacilitiesUi.js');
  assert.match(facilitiesUi, /r\.gradedUpLabel/);
  assert.match(facilitiesUi, /showToast/);
});

test('No new save root: species grade is computed on the fly from the existing ranchResearch recruited counter, nothing new is written to state.data', () => {
  const src = read('js/patches/ranchSpeciesGrade.js');
  assert.doesNotMatch(src, /state\.data\.\w+\s*(=|&&=|\?\?=)/, 'ranchSpeciesGrade.js must not introduce a new top-level save field');
  assert.doesNotMatch(src, /localStorage/);
});

test('No platform emoji introduced by the species grade feature', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/patches/ranchSpeciesGrade.js', 'js/patches/ranchCollectionUi.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});

// ---- C6-5: what species grade mechanically unlocks ----------------------
// Deliberately NOT a flat stat ladder: grade scales the POWER of the
// species' own already-authored combat trait (read every battle by
// companionBattle.js's traitEffect()) instead of adding a new stat line.
// Normal/Rare/Epic keep the trait at authored strength -- duplicate
// recruitment below Legendary stays about collection identity (C6-4), not
// power, matching the roadmap's own warning against "another uncapped
// vertical power ladder".

test('C6-5: speciesGradeTraitMult only rises at Legendary/Mythic -- Normal/Rare/Epic keep the authored trait strength unchanged', () => {
  assert.equal(speciesGradeTraitMult('normal'), 1);
  assert.equal(speciesGradeTraitMult('rare'), 1);
  assert.equal(speciesGradeTraitMult('epic'), 1);
  assert.ok(speciesGradeTraitMult('legendary') > 1);
  assert.ok(speciesGradeTraitMult('mythic') > speciesGradeTraitMult('legendary'), 'Mythic must be the strongest grade, not tied with Legendary');
  assert.equal(speciesGradeTraitMult('not-a-real-grade'), 1, 'an unknown grade must fall back to no change, never throw or 0x');
  assert.deepEqual(Object.keys(SPECIES_GRADE_TRAIT_MULT), SPECIES_GRADE_THRESHOLDS.map((t) => t.grade), 'every real grade must have an entry, in the same order as SPECIES_GRADE_THRESHOLDS');
});

test('Runtime: state.ranchSpeciesGrade().traitMult is the single source of truth -- it is 1 below Legendary and rises exactly at the Legendary threshold (50 recruits)', () => {
  state.resetAll();
  const speciesId = 'goblin';
  for (let i = 0; i < 49; i++) state.recordRanchRecruit(speciesId);
  assert.equal(state.ranchSpeciesGrade(speciesId).grade, 'epic');
  assert.equal(state.ranchSpeciesGrade(speciesId).traitMult, 1);
  state.recordRanchRecruit(speciesId); // 50th -- crosses into legendary
  const graded = state.ranchSpeciesGrade(speciesId);
  assert.equal(graded.grade, 'legendary');
  assert.equal(graded.traitMult, speciesGradeTraitMult('legendary'));
  assert.ok(graded.traitMult > 1);
});

test('C6-5: companionBattle.js scales an existing trait\'s power by the owning species\' current grade, via state.ranchSpeciesGrade -- no new trait data, no new battle authority', () => {
  const text = read('js/patches/companionBattle.js');
  assert.match(text, /import \{ speciesGradeTraitMult \}|state\.ranchSpeciesGrade\?\.\(companion\.speciesId\)/, 'traitEffect must consult the species\' grade, not a hardcoded number');
  assert.match(text, /traitMult/);
  assert.match(text, /power:effect\.power\*mult/, 'must scale the existing effect\'s power field rather than introduce a parallel damage/mitigation system');
});

test('C6-5: Ranch and collection UI show the trait-power bonus so grade stays deterministic and inspectable, not a hidden multiplier', () => {
  const ui = read('js/patches/monsterRanchUi.js');
  assert.match(ui, /特性威力/);
  assert.match(ui, /grade\.traitMult/);
  const collectionUi = read('js/patches/ranchCollectionUi.js');
  assert.match(collectionUi, /特性威力/);
  assert.match(collectionUi, /grade\.traitMult/);
});
