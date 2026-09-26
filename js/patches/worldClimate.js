/* ============================================================
   Session 8 — World Climate runtime
   ------------------------------------------------------------
   The canonical clock is the settlement cycle (see
   js/data/worldClimate.js). This patch:
   - exposes state.worldClimate(chapter|stage) for battle/drop/UI;
   - advances the cycle on stage clears (via rollWorld2ClearRewards,
     same wrap idiom as systemDeepeningPackC);
   - records witnessed weather/daypart into world2.weatherSeen /
     daypartSeen so conditional secrets are derived, never lost;
   - provides state.mutationRollContext() consumed by battleEngine.
   No new save root: everything lives under world2.
   ============================================================ */
import './world2Core.js';
import './settlementSeasons.js';
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import {
  WORLD_WEATHER, WORLD_DAYPARTS, REGION_CLIMATE,
  climateIdForChapter, climateIdForTags, weatherForClimate, daypartForCycle,
  CLIMATE_HUNT_MODS, CLIMATE_DROP_RANK_BONUS,
} from '../data/worldClimate.js';
import { rollMutation } from '../data/mutations.js';

function ensureWorld() {
  state.data.world2 ??= {};
  const w = state.data.world2;
  w.weatherSeen ??= {};
  w.daypartSeen ??= {};
  return w;
}
ensureWorld();

function chapterForStageId(stageId) {
  const raw = String(stageId || '');
  const num = /^(\d+)-/.exec(raw)?.[1];
  if (num) return CHAPTERS.find((c) => c.num === Number(num)) || null;
  return CHAPTERS.find((c) => c.stages?.some((s) => s.id === raw)) || null;
}

state.worldClimate = function worldClimate(chapterOrStage) {
  const cycleState = this.settlementSeasonState?.() || {};
  const cycle = Math.max(0, Math.floor(Number(cycleState.cycle) || 0));
  const climateId = chapterOrStage?.dropRegionTags
    ? climateIdForTags(chapterOrStage.dropRegionTags, chapterOrStage.chapter || null)
    : climateIdForChapter(chapterOrStage);
  return {
    cycle,
    climateId,
    season: cycleState.season || null,
    daypart: daypartForCycle(cycle),
    weather: weatherForClimate(climateId, cycle),
  };
};

// Advance the single world clock. Existing settlement button calls
// advanceSettlementCycle directly; clears/events call this wrapper so
// witnessed weather gets recorded on every advance.
state.advanceWorldCycle = function advanceWorldCycle() {
  const before = this.settlementSeasonState?.();
  const snap = this.advanceSettlementCycle ? this.advanceSettlementCycle() : null;
  return snap || before;
};

// Forecast for hunter-agency: same chapter climate, future epochs.
state.worldForecast = function worldForecast(chapter, steps = 2) {
  const cur = (this.settlementSeasonState?.()?.cycle) || 0;
  const climateId = climateIdForChapter(chapter);
  const out = [];
  for (let i = 1; i <= steps; i++) {
    const c = cur + i * 4;
    out.push({ cycle: c, weather: weatherForClimate(climateId, c), daypart: daypartForCycle(c) });
  }
  return out;
};

// One call the engine/UI share: everything a stage needs to know about
// the living world right now.
state.climateForStage = function climateForStage(stage) {
  const chapter = stage?.chapter || chapterForStageId(stage?.id) || this.chapterForStage?.(stage?.id) || null;
  const cl = this.worldClimate(stage?.dropRegionTags ? { ...stage, chapter } : chapter);
  const locTags = stage?.locTags || chapter?.locTags || stage?.dropRegionTags || [];
  return {
    ...cl,
    locTags,
    weatherId: cl.weather?.id || 'clear',
    daypartId: cl.daypart?.id || 'day',
    huntMods: {
      rareChanceBonus: CLIMATE_HUNT_MODS.rareChanceBonus[cl.weather?.id] || 0,
      roamerChanceBonus: CLIMATE_HUNT_MODS.roamerChanceBonus[cl.weather?.id] || 0,
      mutationChanceMult: (CLIMATE_HUNT_MODS.mutationChanceMult[cl.weather?.id] || 1)
        * (CLIMATE_HUNT_MODS.daypartMutationMult[cl.daypart?.id] || 1),
      dropRankBonus: CLIMATE_DROP_RANK_BONUS[cl.weather?.id] || 0,
    },
  };
};

// Mutation roll for a single spawn. ctx.family comes from the recruit map.
state.rollEnemyMutation = function rollEnemyMutation(enemyType, ctx = {}) {
  const extra = { ...(ctx || {}) };
  extra.weatherId ??= ctx.weatherId;
  extra.daypartId ??= ctx.daypartId;
  if (ctx.locationBoost) extra.locationBoost = ctx.locationBoost;
  return rollMutation({ ctx: extra });
};

// Climate gate: a path exists only while the living world matches.
// Returns 'open' | 'waiting' | 'hidden' — 'waiting' means the location
// is KNOWN but the weather/daypart is wrong right now (foreshadow).
state.climateGateState = function climateGateState(gate, chapter) {
  if (!gate) return 'open';
  const w = ensureWorld();
  const cl = this.worldClimate(chapter || null);
  const needW = gate.weathers || [];
  const needD = gate.dayparts || [];
  const wOk = !needW.length || needW.includes(cl.weather?.id);
  const dOk = !needD.length || needD.includes(cl.daypart?.id);
  if (wOk && dOk) return 'open';
  // Known-before (witnessed this condition at least once) -> waiting card.
  const seenW = !needW.length || needW.some((id) => w.weatherSeen[id]);
  const seenD = !needD.length || needD.some((id) => w.daypartSeen[id]);
  return (seenW && seenD) ? 'waiting' : 'hidden';
};

// Record witnessed climate + advance world clock on every cleared stage.
// Same wrap idiom as systemDeepeningPackC: our sync runs first, then the
// previous implementation decides everything else.
if (state.rollWorld2ClearRewards && !state.rollWorld2ClearRewards.__worldClimate) {
  const previous = state.rollWorld2ClearRewards.bind(state);
  const wrapped = function worldClimateClearRewards(stage, opts = {}) {
    const w = ensureWorld();
    const cl = this.climateForStage(stage || {});
    w.weatherSeen[cl.weatherId] = true;
    w.daypartSeen[cl.daypartId] = true;
    this.advanceWorldCycle?.();
    return previous(stage, opts);
  };
  wrapped.__worldClimate = true;
  state.rollWorld2ClearRewards = wrapped;
}

export { ensureWorld as ensureClimateWorld };
