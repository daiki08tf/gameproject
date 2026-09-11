/* ============================================================
   Living World & Discovery C7-1 — Settlement Incidents runtime
   ------------------------------------------------------------
   Save data lives under the existing __settlement3 meta key (the
   same nesting pattern Archaeology/Treasure Hunt/Defense already
   use) -- no new save root. The active investigation itself is
   transient UI state (module-level, not persisted): only the
   OUTCOME (resolved) is saved, exactly like Archaeology's dig
   session.

   The Rumor Notebook write is the concrete realization of C7's own
   "Incident = something happening" / "Rumor = what people know
   about it" distinction: an eligible-but-unresolved incident writes
   an "unresolved" Rumor hint (the incident's own `desc`); resolving
   it rewrites the SAME Rumor entry to the `record.text` outcome,
   using the exact {rumor:true, rumorId, name, hint, rumorState,
   rumorStateLabel, at, resolvedAt} shape js/patches/ch1RumorThreads.js
   and js/patches/treasureHunt.js already established, so it renders
   in the existing Rumor Notebook UI with zero changes there.
   ============================================================ */
import { state } from '../state.js';
import { resolveExcavationRound, rollExcavationCue, excavationDifficultyProfile, computeArchaeologyReward } from '../data/archaeology.js';
import { SETTLEMENT_INCIDENTS, settlementIncidentEligible, getSettlementIncident } from '../data/settlementIncidents.js';

const META_KEY = '__settlement3';
function meta() {
  const root = state.data.settlementBuildings ??= { hall: 0, inn: 0, market: 0, watch: 0, ranch: 0 };
  const m = root[META_KEY] ??= {};
  if (!m.incidents || typeof m.incidents !== 'object' || Array.isArray(m.incidents)) m.incidents = { resolved: {} };
  if (!m.incidents.resolved || typeof m.incidents.resolved !== 'object' || Array.isArray(m.incidents.resolved)) m.incidents.resolved = {};
  return m.incidents;
}

function ctx() { return { hall: state.settlementLevel?.('hall') || 0 }; }

function ensureWorld() {
  state.data.world2 ??= {};
  state.data.world2.discoveries ??= {};
  return state.data.world2;
}

// Pure-ish computation (reads state, doesn't write) shared by
// state.settlementIncidents() and syncRumorNotebook() below -- same split
// treasureHunt.js's computeTreasureHunts()/syncRumorNotebook() already
// established, so syncing never recomputes by calling back into itself.
function computeIncidents() {
  const c = ctx();
  const m = meta();
  return SETTLEMENT_INCIDENTS.map((incident) => {
    const eligible = settlementIncidentEligible(incident, c);
    const resolved = !!m.resolved[incident.id];
    return { ...incident, eligible, resolved, active: eligible && !resolved };
  });
}

function syncRumorNotebook(incidents) {
  const world = ensureWorld();
  for (const incident of incidents) {
    const id = `rumor:incident_${incident.id}`;
    if (!incident.eligible) { delete world.discoveries[id]; continue; }
    const prev = world.discoveries[id];
    world.discoveries[id] = {
      ...prev,
      rumor: true,
      rumorId: `incident_${incident.id}`,
      name: `噂：${incident.name}`,
      hint: incident.resolved ? incident.record.text : incident.desc,
      rumorState: incident.resolved ? 'resolved' : 'unresolved',
      rumorStateLabel: incident.resolved ? '解決済み' : '未解決',
      at: prev?.at || Date.now(),
      resolvedAt: incident.resolved ? (prev?.resolvedAt || Date.now()) : prev?.resolvedAt,
    };
  }
}

// Every call recomputes fresh (matching state.archaeologySites()/
// state.treasureHunts()'s own always-recompute convention) and keeps the
// Rumor Notebook in sync as a side effect.
state.settlementIncidents = function settlementIncidents() {
  const incidents = computeIncidents();
  syncRumorNotebook(incidents);
  return incidents;
};

// One investigation at a time, same busy-guard rule Archaeology/Fishing
// already established.
let activeSession = null;

state.startSettlementIncidentInvestigation = function startSettlementIncidentInvestigation(id) {
  if (activeSession) return { ok: false, reason: 'busy' };
  const incident = state.settlementIncidents().find((x) => x.id === id);
  if (!incident) return { ok: false, reason: 'unknown' };
  if (!incident.active) return { ok: false, reason: incident.resolved ? 'resolved' : 'locked' };
  const cue = rollExcavationCue();
  const profile = excavationDifficultyProfile(incident.fragment.difficulty);
  activeSession = { incidentId: id, fragment: incident.fragment, progress: 0, misses: 0, ...cue };
  return { ok: true, incident, profile, progress: 0, misses: 0, maxMisses: profile.maxMisses, roundsNeeded: profile.roundsNeeded, cueText: cue.cueText };
};

state.settlementIncidentAction = function settlementIncidentAction(action) {
  if (!activeSession) return { ok: false, reason: 'no-session' };
  const { fragment, correctAction, incidentId } = activeSession;
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
  activeSession = null;
  if (result.outcome === 'crumbled') return { ok: true, outcome: 'crumbled', hit: result.hit, incidentId, fragment };
  // recovered -- this incident is a one-shot, so recovering the fragment
  // resolves it outright (no repeat-visit collection loop like a full
  // Archaeology site).
  const incident = getSettlementIncident(incidentId);
  const m = meta();
  m.resolved[incidentId] = true;
  const reward = computeArchaeologyReward(fragment, true);
  const gained = Object.keys(reward.materials).length ? (state.addSettlementMaterials?.(reward.materials) || {}) : {};
  if (reward.gold > 0) { state.data.gold = Math.max(0, (Number(state.data.gold) || 0) + reward.gold); gained.gold = reward.gold; }
  const recordReward = incident.record?.reward || {};
  const recordGained = Object.keys(recordReward).length ? (state.addSettlementMaterials?.(recordReward) || {}) : {};
  if (recordReward.gold > 0) { state.data.gold = Math.max(0, (Number(state.data.gold) || 0) + recordReward.gold); recordGained.gold = recordReward.gold; }
  state.settlementIncidents(); // re-sync the Rumor Notebook entry to the now-resolved state
  state.save();
  return { ok: true, outcome: 'resolved', incident, gained, recordGained, record: incident.record };
};
