/* ============================================================
   Session 8 — World Climate (game-time + regional weather)
   ------------------------------------------------------------
   The canonical world clock is the EXISTING settlement cycle
   (settlementBuildings.__settlement3.seasons.cycle, advanced by
   state.advanceSettlementCycle). This file adds NO new clock:
   it only reinterprets that one cycle into a field-facing
   daypart + a per-region weather state, so old saves derive
   everything lazily and nothing can disagree with settlement
   UI.

   Weather pools are semantic — keyed by a region/climate id
   resolved from chapter tags (locTags / regionId / poiKind),
   never per-chapter hardcoding.
   ============================================================ */

export const WORLD_WEATHER = Object.freeze({
  clear: { id: 'clear', name: '晴れ', desc: '雲一つない空。', fieldHint: '何も異常はない。' },
  rain:  { id: 'rain',  name: '雨',   desc: '冷たい雨。足跡が浮き、水面が騒ぐ。', fieldHint: '水の気配が濃い。' },
  storm: { id: 'storm', name: '嵐',   desc: '稲光が近い。空気そのものが帯電している。', fieldHint: '雷の気配。空の獣が近いかもしれない。' },
  mist:  { id: 'mist',  name: '霧',   desc: '深い霧。見えるはずのない輪郭が浮く。', fieldHint: '目に見えない道が浮く気配。' },
  ash:   { id: 'ash',   name: '灰降り', desc: '空から灰が降る。死者が歩きやすい空気。', fieldHint: '墓と燃え跡の匂い。' },
  snow:  { id: 'snow',  name: '雪',   desc: '音を吸う雪。獣の吐息だけが白い。', fieldHint: '足跡だけが残る。' },
});

export const WORLD_DAYPARTS = Object.freeze({
  dawn:   { id: 'dawn',   name: '暁',   desc: '夜の残りが崖に残る時間帯。' },
  day:    { id: 'day',    name: '昼',   desc: '最も世界が素直な時間帯。' },
  dusk:   { id: 'dusk',   name: '夕',   desc: '日が傾く。道が歩く者を選び始める。' },
  night:  { id: 'night',  name: '夜',   desc: '見えないものが動く時間帯。' },
});

// Region climate ids resolve from chapter locTags / region metadata.
// Pools are weighted id lists; cycle→weather pick is deterministic.
export const REGION_CLIMATE = Object.freeze({
  default: { pool: ['clear','clear','clear','rain','rain','mist','windless','clear','clear','storm'] },
  water:   { pool: ['rain','rain','rain','mist','mist','clear','storm','rain','mist','clear'] },
  storm:   { pool: ['storm','storm','wind','storm','rain','clear','storm','clear','mist','storm'] },
  grave:   { pool: ['ash','mist','ash','mist','clear','ash','mist','ash','night-clear','ash'] },
  ash:     { pool: ['ash','ash','clear','ash','mist','ash','clear','ash','storm','ash'] },
  ice:     { pool: ['snow','snow','clear','snow','mist','snow','clear','snow','storm','snow'] },
  machine: { pool: ['clear','clear','ash','clear','mist','clear','storm','clear','clear','ash'] },
  deep:    { pool: ['mist','mist','clear','rain','mist','ash','mist','clear','mist','rain'] },
  beast:   { pool: ['clear','clear','clear','rain','mist','clear','snow','clear','rain','mist'] },
  spirit:  { pool: ['mist','mist','ash','mist','clear','mist','mist','clear','ash','mist'] },
});

// 'wind' and 'night-clear' are aliases kept inside pools for variety but
// resolve to canonical weather ids when read.
const WEATHER_ALIAS = Object.freeze({ wind: 'clear', windless: 'clear', 'night-clear': 'clear' });

// Region-profile → climate id for the authored story chapters (their
// regionProfile.id comes from world3Regions/regionsPhase9).
const PROFILE_CLIMATE = Object.freeze({
  ashen_rim: 'ash', glass_tundra: 'ice', thunder_graves: 'storm',
  hollow_garden: 'spirit', machine_audit_layer: 'machine',
  zero_external_link: 'deep', far_signal_echo: 'deep',
  reverse_observation_gate: 'deep', external_observation_core: 'deep',
  response_grammar_layer: 'machine', eighth_key_reverse_layer: 'deep',
  missing_interval_layer: 'deep', common_reference_window: 'default',
  shared_observation_point: 'default', boundary_throne: 'grave',
});

// Side-location chapter ids → climate. Authored per-location ecology
// from js/data/sideLocations{,2}.js; this is a lookup, not a new
// region authority — the chapters remain the source of truth.
const SIDE_CLIMATE = Object.freeze({
  side_mossgrove: 'beast', side_rustmine: 'machine', side_windshrine: 'storm',
  side_hollow: 'spirit', side_gravepath: 'grave', side_silentforge: 'machine',
  side_stormpeak: 'storm', side_deepden: 'deep', side_floodgate: 'water',
  side_skycliff: 'storm', side_rootwarren: 'beast', side_echocrypt: 'spirit',
  side_gallowseep: 'grave', side_forgeheart: 'machine', side_bonepit: 'beast',
  side_stormroost: 'storm', side_graveshift: 'grave', side_depthwell: 'deep',
  side_apexmesa: 'deep', side_unrecorded: 'deep',
});

// Chapter → climate id. Reads the same semantic tags Session 7 already
// writes onto chapters/stages (locTags/dropRegionTags) plus regionProfile;
// unknown chapters fall back to 'default'. A stage's dropRegionTags can
// override the chapter-level pick (a grave floor inside a plain region).
export function climateIdForTags(tags = [], chapter = null) {
  if (chapter?.climateId && REGION_CLIMATE[chapter.climateId]) return chapter.climateId;
  if (chapter?.id && SIDE_CLIMATE[chapter.id]) return SIDE_CLIMATE[chapter.id];
  const t = new Set([...(tags || []), ...(chapter?.locTags || []), chapter?.poiKind || '']);
  if (t.has('storm')) return 'storm';
  if (t.has('water') || t.has('aquatic')) return 'water';
  if (t.has('grave')) return 'grave';
  if (t.has('ash')) return 'ash';
  if (t.has('ice')) return 'ice';
  if (t.has('machine')) return 'machine';
  if (t.has('deep') || t.has('unrecorded')) return 'deep';
  if (t.has('spirit')) return 'spirit';
  if (t.has('beast')) return 'beast';
  return PROFILE_CLIMATE[chapter?.regionProfile?.id] || 'default';
}

export function climateIdForChapter(chapter) {
  if (!chapter) return 'default';
  const stageTags = (chapter.stages || []).flatMap((s) => s.dropRegionTags || []);
  return climateIdForTags(stageTags, chapter);
}

// Deterministic weather pick: hash(region, weatherEpoch). The epoch is
// floor(cycle/4)-based so weather holds across a full day cycle (4
// dayparts) instead of flickering every tap.
function hashRegionCycle(climateId, epoch) {
  let h = 2166136261 >>> 0;
  const s = `${climateId}:${epoch}`;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}

export function weatherForClimate(climateId, cycle) {
  const region = REGION_CLIMATE[climateId] || REGION_CLIMATE.default;
  const epoch = Math.floor(Math.max(0, cycle) / 4);
  const idx = hashRegionCycle(climateId, epoch) % region.pool.length;
  const raw = region.pool[idx];
  return WORLD_WEATHER[WEATHER_ALIAS[raw] || raw] || WORLD_WEATHER.clear;
}

export function daypartForCycle(cycle) {
  const c = Math.max(0, Math.floor(Number(cycle) || 0));
  const seq = ['dawn', 'day', 'dusk', 'night'];
  return WORLD_DAYPARTS[seq[c % seq.length]];
}

// Weather boost on rare/variant encounters. Bounded and additive —
// knowledge (mastery/rumor) stays the dominant lever.
export const CLIMATE_HUNT_MODS = Object.freeze({
  rareChanceBonus: Object.freeze({ storm: .03, mist: .04, ash: .04, snow: .02, rain: .02 }),
  roamerChanceBonus: Object.freeze({ storm: .02, mist: .02, ash: .015, snow: .01, rain: .01 }),
  mutationChanceMult: Object.freeze({ storm: 2.0, mist: 1.8, ash: 1.7, rain: 1.4, snow: 1.5, clear: 1 }),
  daypartMutationMult: Object.freeze({ night: 1.8, dusk: 1.4, dawn: 1.2, day: 1 }),
});

// Rank-of-thunder: weather adds a small rankBias so storm-hunts feel
// meaningfully richer without approaching vault tier.
export const CLIMATE_DROP_RANK_BONUS = Object.freeze({ storm: .04, mist: .05, ash: .05, snow: .03, rain: .02, clear: 0 });
