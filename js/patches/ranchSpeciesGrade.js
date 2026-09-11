/* ============================================================
   Living World & Discovery C6-4 — Deterministic species grade
   ------------------------------------------------------------
   A species' collective grade (Normal -> Rare -> Epic -> Legendary ->
   Mythic) is a pure, deterministic function of how many times that
   species has been recruited -- state.data.ranchResearch[speciesId]
   .recruited, the exact counter C6-1's automatic recruitment (and egg
   hatching) already increments via state.recordRanchRecruit(). No new
   save field, no random roll: grade only ever goes up, and the player
   can always see how many more recruits reach the next grade.

   This is a SEPARATE axis from a companion's own individual instance
   rarity (COMPANION_RARITY, rolled once at recruitment and still used
   for breeding/talent-floor/evolution gating -- unchanged by this
   file). Per this session's C6-0 audit: individual instances, breeding
   and godRoll stay exactly as they are; grade is an additive display
   layer on top, not a replacement. What grade mechanically unlocks
   (C6-5) is a deliberately separate, later step.
   ============================================================ */
import { state } from '../state.js';
import { speciesGrade, speciesGradeProgress, speciesGradeTraitMult, POST_MYTHIC_RECRUIT_MEMORY_BONUS } from '../data/monsterRanch.js';
import { COMPANION_RARITY_LABEL, getCompanionSpecies } from '../data/companions.js';

// Reuses the exact same label vocabulary already shown for individual
// instance rarity (ノーマル/レア/エピック/レジェンダリー/ミシック) so a
// species grade never reads as a different scale from what the player
// already knows.
//
// C6-5: `traitMult` is the single source of truth for what grade
// mechanically unlocks -- companionBattle.js's traitEffect() reads it via
// this same function so the battle-applied number and the number shown in
// the Ranch/collection UI can never drift apart.
state.ranchSpeciesGrade = function ranchSpeciesGrade(speciesId) {
  const recruited = this.ranchResearch?.(speciesId)?.recruited || 0;
  const progress = speciesGradeProgress(recruited);
  return {
    ...progress,
    label: COMPANION_RARITY_LABEL[progress.grade] || progress.grade,
    nextLabel: progress.next ? (COMPANION_RARITY_LABEL[progress.next] || progress.next) : null,
    remaining: progress.nextCount != null ? Math.max(0, progress.nextCount - recruited) : 0,
    traitMult: speciesGradeTraitMult(progress.grade),
  };
};

// Wraps the existing recruit counter (unchanged in what it stores) to also
// report whether this particular recruit pushed the species into a new
// grade -- callers (battle auto-recruit, egg hatching) decide how/whether
// to announce it, so this stays pure data with no toast/DOM of its own
// (avoids two toasts racing for the same #toast element on the same
// recruit -- see companionRecruitment.js's combined announcement).
const previousRecordRanchRecruit = state.recordRanchRecruit?.bind(state);
if (previousRecordRanchRecruit) {
  state.recordRanchRecruit = function gradeAwareRecordRanchRecruit(speciesId) {
    const before = speciesGrade(this.ranchResearch?.(speciesId)?.recruited || 0);
    const result = previousRecordRanchRecruit(speciesId);
    const after = speciesGrade(result?.recruited || 0);
    // C6-9: once a species is already capped at Mythic, a further
    // duplicate can no longer raise the grade -- keep it from being pure
    // noise by feeding the existing (capped) Species Board memory economy
    // instead. See data/monsterRanch.js's POST_MYTHIC_RECRUIT_MEMORY_BONUS
    // comment for why this specific, modest route was chosen.
    if (before === 'mythic') {
      this.data.ranchMemory[speciesId] = (this.data.ranchMemory[speciesId] || 0) + POST_MYTHIC_RECRUIT_MEMORY_BONUS;
      this.save();
      return { ...result, postMythicMemoryBonus: POST_MYTHIC_RECRUIT_MEMORY_BONUS, memoryTotal: this.ranchMemory(speciesId) };
    }
    if (after === before) return result;
    const species = getCompanionSpecies(speciesId);
    return { ...result, gradedUp: after, gradedUpLabel: COMPANION_RARITY_LABEL[after] || after, gradedUpSpeciesName: species?.name || speciesId };
  };
}
