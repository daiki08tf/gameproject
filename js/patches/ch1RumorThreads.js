/* ============================================================
   Living World & Discovery C2 — Chapter 1 Rumor Threads runtime
   ------------------------------------------------------------
   Reuses the existing world2.discoveries Rumor authority (see
   js/patches/systemDeepeningPackC.js) instead of creating a new
   Rumor/Notebook system. This file only ever ADDS/updates records
   keyed 'rumor:ch1_<id>' -- it never touches Phase12/secret-chain
   rumor records, and never introduces a new save root.

   Progress is derived entirely from existing authorities:
   state.isStageCleared(stageId) and state.data.monsterCodex. There
   is no new Rumor-only progress flag.
   ============================================================ */
import './systemDeepeningPackC.js'; // guarantees state.rumorNotebook exists before we wrap it
import { state } from '../state.js';
import { RUMOR_STATES } from '../data/systemDeepeningPackC.js';
import { CH1_RUMOR_THREADS, buildCh1RumorRecord } from '../data/ch1RumorThreads.js';

function ensureWorld() {
  state.data.world2 ??= {};
  state.data.world2.discoveries ??= {};
  return state.data.world2;
}

function ctxFromState() {
  return {
    isStageCleared: (id) => state.isStageCleared(id),
    codex: state.data.monsterCodex || {},
  };
}

export function syncCh1RumorThreads() {
  const w = ensureWorld();
  const ctx = ctxFromState();
  for (const rumor of CH1_RUMOR_THREADS) {
    const id = `rumor:ch1_${rumor.id}`;
    const record = buildCh1RumorRecord(rumor, ctx, w.discoveries[id], RUMOR_STATES);
    if (record) w.discoveries[id] = record; // not discovered yet -> leave no placeholder
  }
}

// Same wrap idiom systemDeepeningPackC.js itself already uses for
// world2ResolveEvent/rollWorld2ClearRewards: run our sync first, then defer
// to the existing rumorNotebook() to enumerate+sort as it already does.
if (state.rumorNotebook && !state.rumorNotebook.__ch1RumorThreads) {
  const previousNotebook = state.rumorNotebook.bind(state);
  const wrapped = function ch1RumorThreadsNotebook(...args) {
    syncCh1RumorThreads();
    return previousNotebook(...args);
  };
  wrapped.__ch1RumorThreads = true;
  state.rumorNotebook = wrapped;
}

// A campfire/tavern entry point only needs "what's unresolved right now",
// without forcing a full notebook read.
state.ch1RumorThreads = function ch1RumorThreads() {
  syncCh1RumorThreads();
  const discoveries = ensureWorld().discoveries;
  return CH1_RUMOR_THREADS
    .map((rumor) => discoveries[`rumor:ch1_${rumor.id}`])
    .filter(Boolean);
};

syncCh1RumorThreads();
