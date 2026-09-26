/* ============================================================
   Session 8 — Rumor Network 2.0 runtime
   ------------------------------------------------------------
   Reuses the canonical rumor authority (world2.discoveries +
   state.rumorNotebook + RUMOR_STATES) via the exact wrap idiom
   that ch1RumorThreads.js established. This file only ever
   ADDs/updates records keyed 'rumor:s8_<id>' and 'conv_<id>'.

   New unlock types are evaluated here from existing authorities:
   weatherSeen/daypartSeen (worldClimate), Codex wildMutations,
   Species Mastery, other threads' entry counts — no new save root,
   no new rumor progress flag.
   ============================================================ */
import './worldClimate.js';
import './ch1RumorThreads.js';
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { RUMOR_STATES } from '../data/systemDeepeningPackC.js';
import { isEntryUnlocked, mergeCh1RumorEntries, ch1RumorStateId } from '../data/ch1RumorThreads.js';
import { SESSION8_RUMOR_THREADS, SESSION8_CONVERGENCES } from '../data/rumorNetwork2.js';
import { climateIdForChapter } from '../data/worldClimate.js';
import { HIDDEN_MERCHANTS } from '../data/hiddenMerchants.js';

function ensureWorld() {
  state.data.world2 ??= {};
  const w = state.data.world2;
  w.discoveries ??= {};
  w.weatherSeen ??= {};
  w.daypartSeen ??= {};
  return w;
}

function clearedCount() {
  return Object.values(state.data.stageProgress || {}).filter((v) => v === true || v?.cleared || Number(v) > 0).length;
}

function wildMutationSeen(stateNeed, mutationId = null) {
  const codex = state.data.monsterCodex || {};
  return Object.values(codex).some((entry) => {
    const wm = entry?.wildMutations;
    if (!wm) return false;
    return Object.entries(wm).some(([mid, rec]) => {
      if (mutationId && mid !== mutationId) return false;
      if (stateNeed === 'seen') return !!rec.seen;
      if (stateNeed === 'killed') return !!rec.killed;
      if (stateNeed === 'recruited') return !!rec.recruited;
      return false;
    });
  });
}

function rumorRecord(rumorId) {
  return state.data.world2?.discoveries?.[`rumor:s8_${rumorId}`] || null;
}
function rumorEntryCountFor(rumorId) {
  return rumorRecord(rumorId)?.entries?.length || 0;
}
function rumorStateFor(rumorId) {
  return rumorRecord(rumorId)?.rumorState || null;
}

function isS8EntryUnlocked(unlock, ctx = {}) {
  if (!unlock) return true;
  const w = ensureWorld();
  switch (unlock.type) {
    case 'weatherSeen': return !!w.weatherSeen[unlock.weatherId];
    case 'weatherSeenAny': return (unlock.weathers || []).some((id) => w.weatherSeen[id]);
    case 'daypartSeen': return !!w.daypartSeen[unlock.daypartId];
    case 'daypartSeenAny': return (unlock.dayparts || []).some((id) => w.daypartSeen[id]);
    case 'wildMutation': return wildMutationSeen(unlock.state || 'seen', unlock.mutationId);
    case 'wildMutationAny': return wildMutationSeen(unlock.state || 'seen', null);
    case 'mastery': return (Number(state.speciesMasteryLevel?.(unlock.speciesId)) || 0) >= (unlock.min || 1);
    case 'rumorState': return rumorStateFor(unlock.rumorId) === (unlock.state || 'resolved');
    case 'rumorEntryCount': return rumorEntryCountFor(unlock.rumorId) >= (unlock.min || 1);
    case 'discovered': return !!w.discoveries[unlock.id];
    case 'clearedCount': return clearedCount() >= (unlock.min || 1);
    case 'flag': return !!w.flags?.[unlock.flag];
    default: return isEntryUnlocked(unlock, ctx);
  }
}

function ctxFromState() {
  return {
    isStageCleared: (id) => state.isStageCleared(id),
    codex: state.data.monsterCodex || {},
  };
}

function buildS8RumorRecord(rumor, ctx, previousRecord, now = Date.now()) {
  const unlocked = [...rumor.entries]
    .sort((a, b) => a.order - b.order)
    .filter((entry) => isS8EntryUnlocked(entry.unlock, ctx));
  if (!unlocked.length) return null;
  const entries = mergeCh1RumorEntries(previousRecord?.entries, unlocked);
  const stateId = ch1RumorStateId(rumor, entries) || 'unresolved';
  const stateInfo = RUMOR_STATES[stateId] || { id: stateId, label: stateId };
  const latest = entries[entries.length - 1];
  const record = {
    ...(previousRecord || {}),
    rumor: true,
    s8Thread: true,
    rumorId: `s8_${rumor.id}`,
    category: rumor.category,
    reliability: rumor.reliability,
    name: `噂：${rumor.title}`,
    hint: latest.text,
    entries,
    rumorState: stateInfo.id,
    rumorStateLabel: stateInfo.label,
    at: previousRecord?.at || entries[0].unlockedAt,
  };
  if (stateInfo.id === 'resolved' && !record.resolvedAt) record.resolvedAt = now;
  return record;
}

function convergenceMet(conv) {
  const w = ensureWorld();
  return conv.needs.every((need) => {
    switch (need.type) {
      case 'rumorEntries': return rumorEntryCountFor(need.rumorId) >= (need.min || 1);
      case 'rumorState': return rumorStateFor(need.rumorId) === (need.state || 'resolved');
      case 'weatherSeenAny': return (need.weathers || []).some((id) => w.weatherSeen[id]);
      case 'daypartSeenAny': return (need.dayparts || []).some((id) => w.daypartSeen[id]);
      case 'wildMutationAny': return wildMutationSeen(need.state || 'seen');
      case 'stageCleared': return !!state.isStageCleared(need.stageId);
      case 'discovered': return !!w.discoveries[need.id];
      default: return false;
    }
  });
}

export function syncRumorNetwork() {
  const w = ensureWorld();
  const ctx = ctxFromState();
  // Two passes: rumors can unlock off each other's fresh entry counts,
  // and entries only ever grow, so a second pass reaches fixpoint.
  for (let pass = 0; pass < 2; pass++) {
    for (const rumor of SESSION8_RUMOR_THREADS) {
      const key = `rumor:s8_${rumor.id}`;
      const record = buildS8RumorRecord(rumor, ctx, w.discoveries[key]);
      if (record) w.discoveries[key] = record;
    }
  }
  for (const conv of SESSION8_CONVERGENCES) {
    if (w.discoveries[conv.id] || !convergenceMet(conv)) continue;
    w.discoveries[conv.id] = {
      name: `合点：${conv.name}`,
      hint: conv.hint,
      convergence: true,
      reveal: conv.reveal || null,
      at: Date.now(),
    };
    w.keyFragments = (Number(w.keyFragments) || 0) + 2;
  }
}

// Hook the canonical notebook: sync before any read, same idiom as
// ch1RumorThreads. Discovery visibility reads world2.discoveries
// directly, so convergence reveals land the moment a rumor resolves.
if (state.rumorNotebook && !state.rumorNotebook.__rumorNetwork8) {
  const previousNotebook = state.rumorNotebook.bind(state);
  const wrapped = function rumorNetwork8Notebook(...args) {
    syncRumorNetwork();
    return previousNotebook(...args);
  };
  wrapped.__rumorNetwork8 = true;
  state.rumorNotebook = wrapped;
}

// Also sync on every stage clear so fresh clears feed rumors before the
// notebook is ever opened (the notebook is display, not authority).
if (state.rollWorld2ClearRewards && !state.rollWorld2ClearRewards.__rumorNetwork8) {
  const previous = state.rollWorld2ClearRewards.bind(state);
  const wrapped = function rumorNetwork8ClearRewards(stage, opts = {}) {
    const out = previous(stage, opts);
    syncRumorNetwork();
    syncMerchantDiscoveries();
    return out;
  };
  wrapped.__rumorNetwork8 = true;
  state.rollWorld2ClearRewards = wrapped;
}

state.rumorNetworkThreads = function rumorNetworkThreads() {
  syncRumorNetwork();
  const discoveries = ensureWorld().discoveries;
  return SESSION8_RUMOR_THREADS
    .map((rumor) => discoveries[`rumor:s8_${rumor.id}`])
    .filter(Boolean);
};

// Hunting knowledge: a heard rumor sharpens the hunt. mutationRuntime
// reads this for its rumorBoost — true when a KNOWN thread's intel
// covers this enemy type or the chapter's climate.
state.rumorIntelBoostFor = function rumorIntelBoostFor(enemyType, chapterId) {
  const w = state.data.world2;
  if (!w?.discoveries) return false;
  const chapter = CHAPTERS.find((c) => c.id === chapterId) || null;
  const climate = chapter ? climateIdForChapter(chapter) : null;
  for (const rumor of SESSION8_RUMOR_THREADS) {
    const rec = w.discoveries[`rumor:s8_${rumor.id}`];
    if (!rec?.entries?.length) continue;
    const intel = rumor.intel || {};
    if (intel.enemyTypes?.includes(enemyType)) return true;
    if (climate && intel.climates?.includes(climate)) return true;
  }
  return false;
};

// Hidden merchant discovery: a merchant exists (as a discovery record)
// when its requirements are met; availability (can trade right now) is
// a separate climate check so "the lantern is lit only at dusk" stays real.
state.hiddenMerchantDiscovered = function hiddenMerchantDiscovered(merchantId) {
  const m = HIDDEN_MERCHANTS.find((x) => x.id === merchantId);
  if (!m) return false;
  const r = m.requires || {};
  if (r.rumorEntries && rumorEntryCountFor(r.rumorEntries.rumorId) < (r.rumorEntries.min || 1)) return false;
  if (r.clearedStages && clearedCount() < r.clearedStages) return false;
  if (r.stageCleared && !state.isStageCleared(r.stageCleared)) return false;
  return true;
};

state.hiddenMerchantOpen = function hiddenMerchantOpen(merchantId) {
  const m = HIDDEN_MERCHANTS.find((x) => x.id === merchantId);
  if (!m) return false;
  const a = m.availability || {};
  const cl = state.worldClimate?.(null) || {};
  if (a.weathers?.length && !a.weathers.includes(cl.weather?.id)) return false;
  if (a.dayparts?.length && !a.dayparts.includes(cl.daypart?.id)) return false;
  return true;
};

// Sync merchant discoveries into world2.discoveries so rumors can point
// at them ({type:'discovered'}) and the world keeps a record.
function syncMerchantDiscoveries() {
  const w = ensureWorld();
  for (const m of HIDDEN_MERCHANTS) {
    const id = `merchant_${m.id}`;
    if (w.discoveries[id]) continue;
    if (!state.hiddenMerchantDiscovered(m.id)) continue;
    w.discoveries[id] = {
      name: `隠れ商人：${m.name}`,
      hint: m.discoveryHint,
      hiddenMerchant: m.id,
      at: Date.now(),
    };
  }
}

if (state.rumorNotebook && !state.rumorNotebook.__rumorNetwork8Merchant) {
  const previousNotebook = state.rumorNotebook.bind(state);
  const wrapped = function rumorNetwork8MerchantNotebook(...args) {
    syncMerchantDiscoveries();
    return previousNotebook(...args);
  };
  wrapped.__rumorNetwork8Merchant = true;
  state.rumorNotebook = wrapped;
}

export { syncMerchantDiscoveries, rumorEntryCountFor, wildMutationSeen };
syncRumorNetwork();
syncMerchantDiscoveries();
