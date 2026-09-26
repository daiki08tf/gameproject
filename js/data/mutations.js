/* ============================================================
   Session 8 — Mutations (ultra-rare abnormal variants)
   ------------------------------------------------------------
   A Mutation is NOT a Roamer. A Roamer is a named legendary
   individual; a Mutation is a rare abnormal variant of an
   ordinary species — a semantic predicate layer on top of the
   existing enemy/spawn/recruit/codex pipeline.

   Design bounds:
   - base chance is deliberately tiny; knowledge (Species Mastery,
     rumor intel) and environment (weather/daypart) raise it —
     RNG creates surprise, knowledge creates agency.
   - mutations never target boss types, roamers, or denlords.
   - a mutation composes existing semantics (statMult, trait add,
     drop ctx bias, recruit rarity floor) — no per-species table.
   ============================================================ */

export const MUTATIONS = Object.freeze({
  albino: Object.freeze({
    id: 'albino', label: '白化', namePrefix: '白化',
    flavor: '色素を失った個体。血の巡りが肉眼で透けるほど白い。',
    codexLine: '白化個体。色素の欠損と引き換えに、感知が異様に鋭い。',
    statMult: { hp: 1.15, atk: 1.10, def: 1.05, spd: 1.35 },
    xpMult: 2.0, goldMult: 2.0,
    dropRankBonus: .10, dropChanceMult: 1.5,
    conditions: { weathers: ['mist', 'snow'], dayparts: ['dawn', 'day'], families: ['beast', 'spirit'] },
    recruitRarityFloor: 'rare', traitAdd: '白化の勘',
    baseChance: .0035,
  }),
  eclipse: Object.freeze({
    id: 'eclipse', label: '月蝕', namePrefix: '月蝕',
    flavor: '夜にだけ見える個体。昼に追っても、昼にはいない。',
    codexLine: '月蝕個体。影の薄い時間帯を選んで活動する。夜に追え。',
    statMult: { hp: 1.25, atk: 1.30, def: 1.15, spd: 1.20 },
    xpMult: 2.2, goldMult: 2.2,
    dropRankBonus: .12, dropChanceMult: 1.6,
    conditions: { dayparts: ['night', 'dusk'], families: ['beast', 'spirit', 'undead'] },
    recruitRarityFloor: 'epic', traitAdd: '蝕の気配',
    baseChance: .0030,
  }),
  rampage: Object.freeze({
    id: 'rampage', label: '暴走核', namePrefix: '暴走',
    flavor: '核が暴走している。弱いのではなく、制御を失った強さ。',
    codexLine: '暴走核個体。内側の核が過剰反応を起こし、出力が跳ね上がる。',
    statMult: { hp: 1.40, atk: 1.55, def: 0.85, spd: 1.10 },
    xpMult: 2.4, goldMult: 2.0,
    dropRankBonus: .14, dropChanceMult: 1.7,
    conditions: { weathers: ['storm', 'ash'], families: ['construct', 'beast', 'undead'] },
    recruitRarityFloor: 'epic', traitAdd: '暴走痕',
    baseChance: .0028,
  }),
  abyssal: Object.freeze({
    id: 'abyssal', label: '深淵適応', namePrefix: '深淵',
    flavor: '深く沈んだ場所で育った個体。光を嫌い、圧に慣れている。',
    codexLine: '深淵適応個体。深部環境への適応痕。浅い場所ではほぼ見られない。',
    statMult: { hp: 1.50, atk: 1.20, def: 1.35, spd: 0.85 },
    xpMult: 2.6, goldMult: 2.4,
    dropRankBonus: .16, dropChanceMult: 1.8,
    conditions: { locTags: ['deep', 'grave'], weathers: ['ash', 'mist'], dayparts: ['night'], minChapter: 16 },
    recruitRarityFloor: 'epic', traitAdd: '深淵適応',
    baseChance: .0022,
  }),
  charged: Object.freeze({
    id: 'charged', label: '雷化', namePrefix: '雷化',
    flavor: '体毛の一本一本が逆立ち、指すだけで静電気が走る。',
    codexLine: '雷化個体。嵐のエネルギーを体内に溜め込んだ異常適応。',
    statMult: { hp: 1.20, atk: 1.45, def: 1.0, spd: 1.40 },
    xpMult: 2.3, goldMult: 2.3,
    dropRankBonus: .13, dropChanceMult: 1.7, affixCats: ['offense'],
    conditions: { weathers: ['storm'], families: ['beast', 'spirit', 'construct'] },
    recruitRarityFloor: 'epic', traitAdd: '雷化した体',
    baseChance: .0028,
  }),
  ghostly: Object.freeze({
    id: 'ghostly', label: '幽体化', namePrefix: '幽体',
    flavor: '輪郭が揺れている。斬っても、何かが残る気がする。',
    codexLine: '幽体化個体。実体と幻影の境目が曖昧。霧の中でしか観測されない。',
    statMult: { hp: 0.85, atk: 1.25, def: 0.70, spd: 1.50 },
    xpMult: 2.5, goldMult: 2.2,
    dropRankBonus: .15, dropChanceMult: 1.8, affixCats: ['magic', 'special'],
    conditions: { weathers: ['mist', 'ash'], dayparts: ['dusk', 'night'], families: ['spirit', 'undead'] },
    recruitRarityFloor: 'epic', traitAdd: '幽体',
    baseChance: .0025,
  }),
  oldblood: Object.freeze({
    id: 'oldblood', label: '古血', namePrefix: '古血',
    flavor: '血筋が古い。現代の個体とは違う、原初の力の残滓。',
    codexLine: '古血個体。種としての本来の力が残っている。主の近くに集まりやすい。',
    statMult: { hp: 1.60, atk: 1.35, def: 1.30, spd: 0.95 },
    xpMult: 3.0, goldMult: 2.6,
    dropRankBonus: .18, dropChanceMult: 2.0,
    conditions: { dayparts: ['dawn', 'dusk'], minChapter: 10, families: ['beast', 'undead', 'construct'] },
    recruitRarityFloor: 'legendary', traitAdd: '古い血',
    baseChance: .0018,
  }),
  crystallized: Object.freeze({
    id: 'crystallized', label: '結晶化', namePrefix: '結晶',
    flavor: '体表に結晶が析出している。死んだのではない。鉱物になっている。',
    codexLine: '結晶化個体。体液の鉱物化が進んだ稀有な変異。遺骸自体が素材になる。',
    statMult: { hp: 1.30, atk: 1.15, def: 1.70, spd: 0.70 },
    xpMult: 2.4, goldMult: 3.0,
    dropRankBonus: .17, dropChanceMult: 1.9, affixCats: ['defense'],
    conditions: { weathers: ['snow', 'mist'], locTags: ['ice', 'deep', 'machine'], minChapter: 8 },
    recruitRarityFloor: 'epic', traitAdd: '結晶化した体',
    baseChance: .0022,
  }),
});

export const MUTATION_LIST = Object.freeze(Object.values(MUTATIONS));

// Session 8 mutation rarity ladder — used by tests and Codex labels.
export function mutationRarityRank(id) {
  const order = { albino: 1, charged: 2, rampage: 2, ghostly: 3, eclipse: 3, crystallized: 4, abyssal: 4, oldblood: 5 };
  return order[id] || 0;
}

function familyOk(mutation, family) {
  return !mutation.conditions?.families || !family || mutation.conditions.families.includes(family);
}

// ctx: { weatherId, daypartId, chapterNum, locTags:[], family, masteryLv,
//        rumorBoost, eventBoost, hunt, lair }
// Returns a multiplier applied to mutation.baseChance. 0 = impossible.
export function mutationConditionMult(mutation, ctx = {}) {
  const c = mutation.conditions || {};
  let mult = 1;
  let matched = false;
  if (c.weathers) {
    if (!ctx.weatherId || !c.weathers.includes(ctx.weatherId)) return 0;
    matched = true;
  }
  if (c.dayparts) {
    if (!ctx.daypartId || !c.dayparts.includes(ctx.daypartId)) return 0;
    matched = true;
  }
  if (c.locTags) {
    const tags = new Set(ctx.locTags || []);
    if (!c.locTags.some((t) => tags.has(t))) return 0;
    matched = true;
  }
  if (Number.isFinite(c.minChapter) && (ctx.chapterNum || 0) < c.minChapter) return 0;
  if (!familyOk(mutation, ctx.family)) return 0;
  // Environment bonuses compound mildly; knowledge compounds more.
  // Bounds: an intentional hunter in the right conditions should see
  // roughly one mutation per few dozen kills — never a per-spawn slot
  // machine, never literally impossible where the ecology allows it.
  const masteryLv = Math.max(0, Math.floor(Number(ctx.masteryLv) || 0));
  if (masteryLv >= 4) mult *= 1.6; else if (masteryLv >= 2) mult *= 1.25;
  if (ctx.rumorBoost) mult *= 1.8;
  if (ctx.eventBoost) mult *= 1.4;
  if (ctx.hunt) mult *= 1.2;
  if (ctx.lair) mult *= 1.3;
  if (ctx.locationBoost) mult *= Math.min(2.5, Math.max(1, Number(ctx.locationBoost) || 1));
  if (ctx.climateMult) mult *= Math.min(2.5, Math.max(1, Number(ctx.climateMult) || 1));
  if (matched) mult *= 1.15; // 条件を満たした環境自体にも微ボーナス
  return mult;
}

export function rollMutation({ rng = Math.random, ctx = {} } = {}) {
  const eligible = MUTATION_LIST.map((m) => ({ m, mult: mutationConditionMult(m, ctx) }))
    .filter((x) => x.mult > 0);
  for (const { m, mult } of eligible) {
    const chance = Math.min(.03, m.baseChance * mult); // 絶対上限：どんな条件でも3%まで
    if (rng() < chance) return m;
  }
  return null;
}

// Companion-side identity persists on instance.wildMutation (NOT
// instance.mutationId — that field belongs to the ranch lineage system).
export function mutationLabel(id) { return MUTATIONS[id]?.label || id; }
export function mutationCompanionTrait(id) { return MUTATIONS[id]?.traitAdd || null; }
