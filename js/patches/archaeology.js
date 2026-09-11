/* ============================================================
   Living World & Discovery C4 — Archaeology runtime
   ------------------------------------------------------------
   Save data lives under the existing __settlement3 meta key (the
   same nesting pattern already used by Settlement Defense/Arena/
   Exploration/Fishing) -- no new save root. The active dig itself
   is transient UI state (module-level, not persisted): only the
   OUTCOME of a recovered fragment (found-record + materials) is
   saved.
   ============================================================ */
import { state } from '../state.js';
import {
  ARCHAEOLOGY_SITES, ARTIFACT_FRAGMENTS, getArchaeologySite, isArchaeologySiteUnlocked,
  pickFragmentForSite, rollExcavationCue, resolveExcavationRound, excavationDifficultyProfile,
  computeArchaeologyReward, isSiteFullyExcavated, getReconstructedRecord, fragmentsForSite,
} from '../data/archaeology.js';
import { companionDiscoveryReaction } from '../data/companionDiscoveryReactions.js';

const META_KEY = '__settlement3';
function meta() {
  const root = state.data.settlementBuildings ??= { hall: 0, inn: 0, market: 0, watch: 0, ranch: 0 };
  const m = root[META_KEY] ??= {};
  if (!m.archaeology || typeof m.archaeology !== 'object' || Array.isArray(m.archaeology)) m.archaeology = { found: {}, records: {} };
  if (!m.archaeology.found || typeof m.archaeology.found !== 'object' || Array.isArray(m.archaeology.found)) m.archaeology.found = {};
  if (!m.archaeology.records || typeof m.archaeology.records !== 'object' || Array.isArray(m.archaeology.records)) m.archaeology.records = {};
  return m.archaeology;
}

function hasClearedChapter(chapterNum) {
  const prefix = `${chapterNum}-`;
  return Object.entries(state.data.stageProgress || {}).some(([id, v]) => id.startsWith(prefix) && (v === true || v?.cleared));
}
function ctx() { return { hasClearedChapter }; }

state.archaeologySites = function archaeologySites() {
  const c = ctx();
  const m = meta();
  return ARCHAEOLOGY_SITES.map((site) => {
    const seenIds = new Set(fragmentsForSite(site.id).filter((f) => m.found[f.id]?.seen).map((f) => f.id));
    return {
      ...site,
      unlocked: isArchaeologySiteUnlocked(site, c),
      foundCount: seenIds.size,
      totalCount: fragmentsForSite(site.id).length,
      recordUnlocked: !!m.records[site.id],
    };
  });
};

// One dig at a time, same busy-guard rule Fishing established for its rod.
let activeSession = null;

state.startExcavation = function startExcavation(siteId) {
  if (activeSession) return { ok: false, reason: 'busy', siteId: activeSession.siteId };
  const site = getArchaeologySite(siteId);
  if (!site) return { ok: false, reason: 'unknown' };
  if (!isArchaeologySiteUnlocked(site, ctx())) return { ok: false, reason: 'locked' };
  const m = meta();
  const seenIds = new Set(fragmentsForSite(siteId).filter((f) => m.found[f.id]?.seen).map((f) => f.id));
  const fragment = pickFragmentForSite(siteId, seenIds);
  if (!fragment) return { ok: false, reason: 'no-fragment' };
  const cue = rollExcavationCue();
  const profile = excavationDifficultyProfile(fragment.difficulty);
  activeSession = { siteId, fragment, progress: 0, misses: 0, ...cue };
  return { ok: true, site, fragment, profile, progress: 0, misses: 0, maxMisses: profile.maxMisses, roundsNeeded: profile.roundsNeeded, cueText: cue.cueText };
};

state.excavationAction = function excavationAction(action) {
  if (!activeSession) return { ok: false, reason: 'no-session' };
  const { fragment, correctAction } = activeSession;
  const result = resolveExcavationRound({ fragment, progress: activeSession.progress, misses: activeSession.misses, correctAction, chosenAction: action });
  activeSession.progress = result.progress;
  activeSession.misses = result.misses;
  const profile = excavationDifficultyProfile(fragment.difficulty);
  if (result.outcome === 'ongoing') {
    const cue = rollExcavationCue();
    activeSession.correctAction = cue.correctAction;
    activeSession.cueText = cue.cueText;
    return { ok: true, outcome: 'ongoing', hit: result.hit, progress: result.progress, misses: result.misses, maxMisses: profile.maxMisses, roundsNeeded: profile.roundsNeeded, cueText: cue.cueText };
  }
  const siteId = activeSession.siteId;
  activeSession = null;
  if (result.outcome === 'crumbled') return { ok: true, outcome: 'crumbled', fragment, hit: result.hit };
  // recovered
  const m = meta();
  const entry = m.found[fragment.id] || { seen: false, count: 0 };
  const first = !entry.seen;
  entry.seen = true;
  entry.count = (entry.count || 0) + 1;
  m.found[fragment.id] = entry;
  const reward = computeArchaeologyReward(fragment, first);
  const gained = Object.keys(reward.materials).length ? (state.addSettlementMaterials?.(reward.materials) || {}) : {};
  if (reward.gold > 0) {
    state.data.gold = Math.max(0, (Number(state.data.gold) || 0) + reward.gold);
    gained.gold = reward.gold;
  }
  let record = null;
  const seenIds = new Set(fragmentsForSite(siteId).filter((f) => m.found[f.id]?.seen).map((f) => f.id));
  if (!m.records[siteId] && isSiteFullyExcavated(siteId, seenIds)) {
    const rec = getReconstructedRecord(siteId);
    if (rec) {
      m.records[siteId] = true;
      const recordGained = state.addSettlementMaterials?.(rec.reward || {}) || {};
      record = { ...rec, gained: recordGained };
    }
  }
  state.save();
  // C6-8: flavor-only reaction -- never touches gained/reward, just an
  // extra line when a matching (family:'undead') companion happens to be
  // active. See data/companionDiscoveryReactions.js for the full rationale.
  const companionReaction = companionDiscoveryReaction('archaeology', state.activeCompanions?.() || []);
  return { ok: true, outcome: 'recovered', fragment, first, gained, count: entry.count, siteId, record, companionReaction };
};

state.archaeologyCodex = function archaeologyCodex() {
  const m = meta();
  return ARTIFACT_FRAGMENTS.map((fragment) => ({ ...fragment, seen: !!m.found[fragment.id]?.seen, count: Number(m.found[fragment.id]?.count || 0) }));
};
state.archaeologyRecords = function archaeologyRecords() {
  const m = meta();
  return ARCHAEOLOGY_SITES.map((site) => {
    const rec = getReconstructedRecord(site.id);
    return rec ? { ...rec, unlocked: !!m.records[site.id] } : null;
  }).filter(Boolean);
};
state.archaeologySummary = function archaeologySummary() {
  const fragments = this.archaeologyCodex();
  const records = this.archaeologyRecords();
  return { found: fragments.filter((f) => f.seen).length, total: fragments.length, recordsUnlocked: records.filter((r) => r.unlocked).length, recordsTotal: records.length };
};
