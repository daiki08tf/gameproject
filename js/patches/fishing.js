/* ============================================================
   Living World & Discovery C3 — Fishing runtime
   ------------------------------------------------------------
   Save data lives under the existing __settlement3 meta key (the
   same nesting pattern already used by Settlement Defense/Arena/
   Exploration) -- no new save root. The active round itself is
   transient UI state (module-level, not persisted): only the
   OUTCOME of a catch (Codex entry + materials) is saved.
   ============================================================ */
import { state } from '../state.js';
import {
  FISHING_SPOTS, FISH_SPECIES, getFishingSpot, isFishingSpotUnlocked,
  pickFishForSpot, rollFishingCue, resolveFishingRound, fishingDifficultyProfile, computeFishingReward,
} from '../data/fishing.js';

const META_KEY = '__settlement3';
function meta() {
  const root = state.data.settlementBuildings ??= { hall: 0, inn: 0, market: 0, watch: 0, ranch: 0 };
  const m = root[META_KEY] ??= {};
  if (!m.fishing || typeof m.fishing !== 'object' || Array.isArray(m.fishing)) m.fishing = { codex: {} };
  if (!m.fishing.codex || typeof m.fishing.codex !== 'object' || Array.isArray(m.fishing.codex)) m.fishing.codex = {};
  return m.fishing;
}

function hasClearedChapter(chapterNum) {
  const prefix = `${chapterNum}-`;
  return Object.entries(state.data.stageProgress || {}).some(([id, v]) => id.startsWith(prefix) && (v === true || v?.cleared));
}

function ctx() { return { hasClearedChapter }; }

state.fishingSpots = function fishingSpots() {
  const c = ctx();
  return FISHING_SPOTS.map((spot) => ({ ...spot, unlocked: isFishingSpotUnlocked(spot, c) }));
};

// No active round in progress -> null. One round in flight -> the current
// cue/progress/misses so the UI can resume after a re-render.
let activeSession = null;

state.startFishing = function startFishing(spotId) {
  const spot = getFishingSpot(spotId);
  if (!spot) return { ok: false, reason: 'unknown' };
  if (!isFishingSpotUnlocked(spot, ctx())) return { ok: false, reason: 'locked' };
  const fish = pickFishForSpot(spotId);
  if (!fish) return { ok: false, reason: 'no-fish' };
  const cue = rollFishingCue();
  const profile = fishingDifficultyProfile(fish.difficulty);
  activeSession = { spotId, fish, progress: 0, misses: 0, ...cue };
  return { ok: true, spot, fish, profile, progress: 0, misses: 0, maxMisses: profile.maxMisses, roundsNeeded: profile.roundsNeeded, cueText: cue.cueText };
};

state.fishingAction = function fishingAction(action) {
  if (!activeSession) return { ok: false, reason: 'no-session' };
  const { fish, correctAction } = activeSession;
  const result = resolveFishingRound({ fish, progress: activeSession.progress, misses: activeSession.misses, correctAction, chosenAction: action });
  activeSession.progress = result.progress;
  activeSession.misses = result.misses;
  const profile = fishingDifficultyProfile(fish.difficulty);
  if (result.outcome === 'ongoing') {
    const cue = rollFishingCue();
    activeSession.correctAction = cue.correctAction;
    activeSession.cueText = cue.cueText;
    return { ok: true, outcome: 'ongoing', hit: result.hit, progress: result.progress, misses: result.misses, maxMisses: profile.maxMisses, roundsNeeded: profile.roundsNeeded, cueText: cue.cueText };
  }
  const spotId = activeSession.spotId;
  activeSession = null;
  if (result.outcome === 'escaped') return { ok: true, outcome: 'escaped', fish, hit: result.hit };
  // caught
  const m = meta();
  const entry = m.codex[fish.id] || { seen: false, caught: 0 };
  const first = !entry.seen;
  entry.seen = true;
  entry.caught = (entry.caught || 0) + 1;
  m.codex[fish.id] = entry;
  const reward = computeFishingReward(fish, first);
  const gained = Object.keys(reward.materials).length ? (state.addSettlementMaterials?.(reward.materials) || {}) : {};
  if (reward.gold > 0) {
    state.data.gold = Math.max(0, (Number(state.data.gold) || 0) + reward.gold);
    gained.gold = reward.gold;
  }
  state.save();
  return { ok: true, outcome: 'caught', fish, first, gained, caught: entry.caught, spotId };
};

state.fishCodex = function fishCodex() {
  const m = meta();
  return FISH_SPECIES.map((fish) => ({ ...fish, seen: !!m.codex[fish.id]?.seen, caught: Number(m.codex[fish.id]?.caught || 0) }));
};
state.fishCodexSummary = function fishCodexSummary() {
  const list = this.fishCodex();
  return { seen: list.filter((f) => f.seen).length, total: list.length, mastersSeen: list.filter((f) => f.master && f.seen).length, mastersTotal: list.filter((f) => f.master).length };
};
