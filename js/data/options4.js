/* ============================================================
   Gear Overhaul — Option 4.0 canonical model
   ------------------------------------------------------------
   Stable Option family IDs, rarity identities, Lv1-100 curves and
   compatibility aliases. The existing Affix `roll` field remains the combat
   bridge, but authored families derive that roll from rarity + level.
   ============================================================ */

export const OPTION_SCHEMA_VERSION = 1;
export const OPTION_LEVEL_MIN = 1;
export const OPTION_LEVEL_MAX = 100;

export const OPTION_RARITY = Object.freeze([
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'ancient',
]);

export const OPTION_COUNT_BY_EQUIPMENT_RARITY = Object.freeze({
  normal: Object.freeze([0, 1]),
  rare: Object.freeze([1, 1]),
  epic: Object.freeze([1, 2]),
  legendary: Object.freeze([2, 3]),
  mythic: Object.freeze([3, 3]),
});

function ladder(common, uncommon, rare, epic, legendary, mythic, ancient) {
  return Object.freeze({ common, uncommon, rare, epic, legendary, mythic, ancient });
}

export const OPTION_FAMILY_ALIASES = Object.freeze({
  build_executioner: 'dmg_execution',
  build_manacycle: 'mp_on_crit',
});

export const OPTION_NAME_LADDERS = Object.freeze({
  // Core stats
  atk_pct: ladder('怪力','剛力','豪腕','鬼力','覇力','神力','天威'),
  mag_pct: ladder('魔力','魔導','秘術','魔極','賢者','神秘','天啓'),
  def_pct: ladder('頑健','堅牢','鉄壁','金剛','不壊','神鎧','絶対防壁'),
  hp_pct: ladder('体力','壮健','不屈','豪胆','不死身','神命','天命'),
  mp_pct: ladder('精神','魔泉','深魔','魔海','大魔源','神泉','無窮'),
  spd_pct: ladder('軽快','疾風','迅雷','瞬迅','神速','雷神','天駆'),
  crit_pct: ladder('鋭眼','鷹眼','慧眼','心眼','天眼','神眼','万象視'),
  evasion_pct: ladder('身軽','軽業','見切り','幻歩','無影','神避','空蝉'),
  armorpen_pct: ladder('貫き','甲砕き','破甲','断甲','穿界','神穿','天断'),

  // Damage
  dmg_all: ladder('闘気','猛気','戦気','覇気','王気','神気','天闘'),
  dmg_normal: ladder('刃筋','剣理','刃巧','武練','達人','武神','無双'),
  dmg_skill: ladder('技練','巧技','練達','絶技','奥義','神技','天技'),
  dmg_spell: ladder('詠唱','術式','魔詠','秘唱','大詠唱','神詠','天唱'),
  dmg_boss: ladder('巨敵狩り','大物狩り','魔獣殺し','竜殺し','王殺し','神殺し','終焉狩り'),
  dmg_elite: ladder('強敵狩り','精鋭狩り','勇将狩り','猛将殺し','覇将殺し','神将殺し','天軍破り'),
  dmg_execution: ladder('追撃','止め','断命','処断','処刑者','死告','終命'),
  crit_damage_pct: ladder('痛撃','強撃','会心撃','必殺','致命','神撃','天壊'),
  weaken_power_pct: ladder('弱点視','弱点看破','破綻視','崩しの眼','脆弱支配','神蝕','天崩'),
  boss_special_mitigation: ladder('怪異避け','対怪異','魔障壁','王護り','覇護','神護','天護'),

  // Sustain
  lifesteal: ladder('吸命','生命吸収','生命奪取','血啜り','魂喰らい','神喰らい','命脈支配'),
  regen: ladder('治癒','再生','活性','超再生','不死性','神癒','永生'),
  heal_on_kill: ladder('勝鬨','喰らいし刃','血祭り','命狩り','魂狩り','神喰み','千命喰らい'),
  heal_on_crit: ladder('会心癒','会心の癒し','急所吸命','必殺吸命','致命吸命','神撃吸命','天撃回生'),
  heal_on_guard: ladder('守り癒','護身','鉄守','金剛守','不壊守','神守','天守回生'),

  // Resource / tempo
  mp_cost_reduce: ladder('節魔','省魔','魔力節約','高効率術式','無駄なき詠唱','神律','無尽詠唱'),
  mp_on_kill: ladder('魔残','魂の残滓','魂抽出','魔力回収','魂炉','神魂炉','万魂循環'),
  mp_on_crit: ladder('会心閃き','魔閃','霊感','魔力循環','大循環','神環','無窮循環'),
  mp_on_guard: ladder('静息','静寂の呼吸','守魔','護法呼吸','大静寂','神息','天息'),
  cdr_pct: ladder('手際','型の冴え','迅速術','高速循環','瞬転','神転','時断'),
  atk_speed_pct: ladder('早撃','瞬撃','連迅','疾襲','神速撃','雷神撃','天瞬'),
  guard_mitigation_pct: ladder('受け','堅守','要塞','鉄城','不落','神塞','天城'),

  // Farming utility
  gold_pct: ladder('商勘','商才','富運','豪商','黄金律','財神','天財'),
  exp_pct: ladder('学び','習熟','研鑽','悟達','大悟','神学','天悟'),
  drop_pct: ladder('小運','幸運','強運','豪運','天運','神運','奇跡'),

  // DoT / status
  dot_dmg: ladder('毒牙','毒手','猛毒','劇毒','死毒','神毒','天蝕'),
  dot_duration: ladder('残毒','侵蝕','深蝕','長蝕','永蝕','神蝕刻','天蝕刻'),
  dot_stack: ladder('積毒','重毒','多重毒','百毒','千毒','神毒積層','万毒'),
  dot_target_dmg: ladder('毒追い','弱毒撃','蝕撃','毒殺撃','死蝕撃','神蝕撃','天蝕撃'),
  dot_mp_on_apply: ladder('毒気','毒煙の呼吸','蝕気循環','毒魔循環','死毒循環','神毒循環','天蝕循環'),

  // Trigger
  crit_extra_hit: ladder('追い刃','会心追撃','会心連撃','連星撃','乱星撃','神連撃','天連撃'),
  crit_atk_buff: ladder('昂り','会心高揚','闘争高揚','覇気高揚','王者高揚','神気高揚','天威高揚'),
  crit_spd_buff: ladder('踏込','会心踏込','疾踏','瞬踏','雷踏','神踏','天駆踏'),
  every_n_hits: ladder('積み技','連技','連環','百錬','千錬','神錬','無限連環'),
  hit_low_dot: ladder('毒刃','呪毒の刃','蝕刃','死毒刃','冥毒刃','神毒刃','天蝕刃'),
  hit_low_defdown: ladder('砕甲刃','甲砕きの刃','破甲刃','断甲刃','穿甲刃','神穿刃','天断刃'),
  guard_next_atk: ladder('受け返し','受けの構え','反攻','剛反','王反','神反','天返し'),
  evade_crit_buff: ladder('身かわし','見切り','心眼歩','無影歩','天眼歩','神避眼','空蝉眼'),
  kill_atk_buff: ladder('勇気','戦意昂揚','猛勢','覇勢','王威','神威','天威連破'),
  spell_mag_buff: ladder('魔気循環','魔力循環の心得','魔導循環','秘術循環','大魔循環','神秘循環','天啓循環'),
  spell_mp_refund: ladder('魔力還元','還元の術理','魔力回帰','大還流','無損詠唱','神還流','無限還流'),

  // Build chase
  build_bloodedge: ladder('血気','血刃','血宴','血王','鮮血王','血神','天血'),
  build_manaecho: ladder('残響','魔力反響','魔響','大魔響','無限反響','神響','天響'),
  build_thousandblades: ladder('連刃','百刃','千刃','万刃','無双刃','神刃陣','天刃界'),
  build_venomheart: ladder('毒心','蝕心','死毒心','冥毒心','毒王心','神毒心','天蝕心'),
  build_ironvengeance: ladder('反撃','鉄の復讐','金剛反撃','不壊反撃','覇王反撃','神罰反撃','天罰反撃'),
  build_predator: ladder('狩人','捕食者','大捕食者','頂点捕食者','覇食者','神喰らい','天喰らい'),
  build_laststand: ladder('窮地','背水','死地','不退','修羅','神修羅','天修羅'),
  build_deathline: ladder('危地','死線','死境','冥境','黄泉路','神境','天境'),
  build_arcanebarrier: ladder('魔壁','魔導防壁','秘術防壁','大魔防壁','絶対魔壁','神壁','天壁'),
  build_quickdraw: ladder('先手','早撃ち','抜撃','瞬抜','神速抜刀','神抜','天抜'),

  // Elements
  element_fire_dmg: ladder('火術','炎術','猛炎','獄炎','業火','神炎','天火'),
  element_ice_dmg: ladder('氷術','凍術','霜獄','氷獄','絶氷','神氷','天氷'),
  element_lightning_dmg: ladder('雷術','迅雷術','轟雷','天雷','雷帝','雷神','天罰雷'),
  element_wind_dmg: ladder('風術','疾風術','烈風','暴嵐','嵐王','風神','天嵐'),
  element_light_dmg: ladder('光術','聖光','輝光','聖輝','天光','神光','創世光'),
  element_dark_dmg: ladder('闇術','深闇','冥闇','深淵','常闇','神闇','終焉闇'),
});

export const OPTION_CURVE_CLASS = Object.freeze({
  RAW_PCT: 'raw_pct',
  MEDIUM_PCT: 'medium_pct',
  SMALL_PCT: 'small_pct',
  REGEN: 'regen',
  PROC_CHANCE: 'proc_chance',
  TRIGGER_POWER: 'trigger_power',
  DISCRETE: 'discrete',
  UTILITY: 'utility',
});

const RAW_BASE = Object.freeze([2, 3, 4, 5.5, 7, 9, 12]);
const RAW_PER_LEVEL = Object.freeze([0.08, 0.10, 0.12, 0.15, 0.18, 0.22, 0.28]);
const MEDIUM_BASE = Object.freeze([1, 1.5, 2.2, 3.2, 4.5, 6, 8]);
const MEDIUM_PER_LEVEL = Object.freeze([0.035, 0.045, 0.055, 0.07, 0.09, 0.115, 0.145]);
const SMALL_BASE = Object.freeze([0.4, 0.7, 1.1, 1.6, 2.2, 3, 4]);
const SMALL_PER_LEVEL = Object.freeze([0.012, 0.016, 0.021, 0.027, 0.034, 0.043, 0.055]);
const REGEN_BASE = Object.freeze([0.2, 0.3, 0.45, 0.65, 0.9, 1.2, 1.55]);
const REGEN_PER_LEVEL = Object.freeze([0.003,0.004,0.005,0.006,0.008,0.010,0.013]);
const PROC_BASE = Object.freeze([3, 5, 8, 12, 17, 23, 30]);
const PROC_PER_LEVEL = Object.freeze([0.06, 0.08, 0.10, 0.13, 0.17, 0.22, 0.28]);
const UTILITY_BASE = Object.freeze([1, 1.4, 2, 2.8, 3.8, 5, 6.5]);
const UTILITY_PER_LEVEL = Object.freeze([0.018,0.024,0.032,0.041,0.052,0.066,0.082]);
const DISCRETE_BASE = Object.freeze([1, 1.5, 2, 2.5, 3, 3.5, 4]);
const DISCRETE_PER_LEVEL = Object.freeze([0.012,0.015,0.018,0.022,0.027,0.033,0.04]);

function curve(curveClass, base, perLevel, cap = null) {
  return Object.freeze({ curve: curveClass, base, perLevel, cap });
}

const RAW = curve(OPTION_CURVE_CLASS.RAW_PCT, RAW_BASE, RAW_PER_LEVEL, 55);
const MEDIUM = curve(OPTION_CURVE_CLASS.MEDIUM_PCT, MEDIUM_BASE, MEDIUM_PER_LEVEL, 35);
const SMALL = curve(OPTION_CURVE_CLASS.SMALL_PCT, SMALL_BASE, SMALL_PER_LEVEL, 18);
const REGEN = curve(OPTION_CURVE_CLASS.REGEN, REGEN_BASE, REGEN_PER_LEVEL, 5);
const PROC = curve(OPTION_CURVE_CLASS.PROC_CHANCE, PROC_BASE, PROC_PER_LEVEL, 70);
const TRIGGER = curve(OPTION_CURVE_CLASS.TRIGGER_POWER, MEDIUM_BASE, MEDIUM_PER_LEVEL, 35);
const UTILITY = curve(OPTION_CURVE_CLASS.UTILITY, UTILITY_BASE, UTILITY_PER_LEVEL, 20);
const DISCRETE = curve(OPTION_CURVE_CLASS.DISCRETE, DISCRETE_BASE, DISCRETE_PER_LEVEL, 12);

export const OPTION_FAMILY_CURVES = Object.freeze({
  atk_pct: RAW, mag_pct: RAW, def_pct: RAW, hp_pct: RAW, mp_pct: RAW,
  spd_pct: MEDIUM, crit_pct: MEDIUM, evasion_pct: MEDIUM, armorpen_pct: MEDIUM,

  dmg_all: RAW, dmg_normal: RAW, dmg_skill: RAW, dmg_spell: RAW,
  dmg_boss: MEDIUM, dmg_elite: MEDIUM, dmg_execution: MEDIUM,
  crit_damage_pct: MEDIUM, weaken_power_pct: MEDIUM, boss_special_mitigation: SMALL,

  lifesteal: MEDIUM, regen: REGEN,
  heal_on_kill: SMALL, heal_on_crit: SMALL, heal_on_guard: SMALL,

  mp_cost_reduce: SMALL, mp_on_kill: SMALL, mp_on_crit: SMALL, mp_on_guard: SMALL,
  cdr_pct: SMALL, atk_speed_pct: SMALL, guard_mitigation_pct: SMALL,

  gold_pct: UTILITY, exp_pct: UTILITY, drop_pct: UTILITY,

  dot_dmg: RAW, dot_duration: MEDIUM, dot_stack: DISCRETE,
  dot_target_dmg: MEDIUM, dot_mp_on_apply: SMALL,

  crit_extra_hit: PROC, crit_atk_buff: PROC, crit_spd_buff: PROC,
  every_n_hits: DISCRETE, hit_low_dot: PROC, hit_low_defdown: PROC,
  guard_next_atk: TRIGGER, evade_crit_buff: TRIGGER, kill_atk_buff: TRIGGER,
  spell_mag_buff: TRIGGER, spell_mp_refund: PROC,

  build_bloodedge: MEDIUM, build_manaecho: PROC,
  build_thousandblades: RAW, build_venomheart: MEDIUM,
  build_ironvengeance: MEDIUM, build_predator: MEDIUM,
  build_laststand: MEDIUM, build_deathline: MEDIUM,
  build_arcanebarrier: SMALL, build_quickdraw: MEDIUM,

  element_fire_dmg: RAW, element_ice_dmg: RAW, element_lightning_dmg: RAW,
  element_wind_dmg: RAW, element_light_dmg: RAW, element_dark_dmg: RAW,
});

function clampInt(value, lo, hi) {
  const n = Math.floor(Number(value));
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}
function clamp(value, lo, hi) { return Math.max(lo, Math.min(hi, value)); }
function rarityIndex(rarity) { return OPTION_RARITY.indexOf(rarity); }
function round2(value) { return Math.round(value * 100) / 100; }
function hashUnit(text) {
  let h = 2166136261;
  for (const ch of String(text || 'bladevale-option')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function canonicalOptionFamilyId(id) {
  return OPTION_FAMILY_ALIASES[id] || id;
}

export function optionCountRange(equipmentRarity) {
  return OPTION_COUNT_BY_EQUIPMENT_RARITY[equipmentRarity] || OPTION_COUNT_BY_EQUIPMENT_RARITY.normal;
}

export function optionDisplayName(familyId, rarity, fallbackName = familyId) {
  const canonical = canonicalOptionFamilyId(familyId);
  return OPTION_NAME_LADDERS[canonical]?.[normalizeOptionRarity(rarity)] || fallbackName || canonical;
}

export function optionDisplayLabel(option, fallbackName = '') {
  if (!option) return fallbackName;
  const familyId = canonicalOptionFamilyId(option.familyId || option.id || '');
  const name = optionDisplayName(familyId, option.rarity, fallbackName || familyId);
  const level = normalizeOptionLevel(option.level ?? 1);
  return `${name} Lv${level}`;
}

export function normalizeOptionLevel(level) {
  return clampInt(level, OPTION_LEVEL_MIN, OPTION_LEVEL_MAX);
}

export function normalizeOptionRarity(rarity) {
  return rarityIndex(rarity) >= 0 ? rarity : OPTION_RARITY[0];
}

export function hasAuthoredOptionCurve(familyId) {
  return !!OPTION_FAMILY_CURVES[canonicalOptionFamilyId(familyId)];
}

export function optionValueAtLevel(familyId, rarity, level, fallbackRoll = 0, { greater = false } = {}) {
  const canonical = canonicalOptionFamilyId(familyId);
  const spec = OPTION_FAMILY_CURVES[canonical];
  if (!spec) return Number(fallbackRoll) || 0;
  const ri = Math.max(0, rarityIndex(normalizeOptionRarity(rarity)));
  const lv = normalizeOptionLevel(level);
  const milestones = [25, 50, 75, 100].filter((mark) => lv >= mark).length;
  const masteryMult = 1 + milestones * 0.02;
  const base = spec.base[ri] || 0;
  const perLevel = spec.perLevel[ri] || 0;
  const greaterMult = greater ? 1.5 : 1;
  let value = (base + (lv - 1) * perLevel) * masteryMult * greaterMult;
  if (spec.cap != null) value = Math.min(spec.cap, value);
  return round2(value);
}

/** Starting level for a newly rolled Option. Natural drops never reach Lv100. */
export function optionStartingLevel(itemPower, ctx = {}, key = '') {
  const ip = clamp(Math.floor(Number(itemPower) || 1), 1, 10000);
  const p = (ip - 1) / 9999;
  const premium = (ctx.elite ? 2 : 0) + (ctx.boss ? 5 : 0) + (ctx.ex ? 6 : 0) + (ctx.nemesis ? 10 : 0);
  let min = 1 + Math.floor(p * 34) + Math.floor(premium * 0.35);
  let max = 10 + Math.floor(p * 55) + premium;
  min = clampInt(min, 1, 75);
  max = clampInt(Math.max(min, max), min, 90);
  const jackpot = p >= 0.85 && hashUnit(`${key}:jackpot`) > 0.985;
  if (jackpot) return 91 + Math.floor(hashUnit(`${key}:jackpot-level`) * 7);
  return min + Math.floor(hashUnit(`${key}:level`) * (max - min + 1));
}

export function optionFromAffix(affix, { level = OPTION_LEVEL_MIN, xp = 0 } = {}) {
  if (!affix?.id) return null;
  const familyId = canonicalOptionFamilyId(affix.familyId || affix.id);
  return {
    ...affix,
    optionSchemaVersion: OPTION_SCHEMA_VERSION,
    familyId,
    rarity: normalizeOptionRarity(affix.rarity),
    level: normalizeOptionLevel(affix.level ?? level),
    xp: Math.max(0, Math.floor(Number(affix.xp ?? xp) || 0)),
  };
}

export function applyAuthoredOptionValue(affix, { itemPower = 1, ctx = {}, key = '', initializeLevel = false } = {}) {
  if (!affix?.id) return affix;
  const option = optionFromAffix(affix, {
    level: initializeLevel ? optionStartingLevel(itemPower, ctx, key || affix.id) : (affix.level ?? 1),
    xp: affix.xp ?? 0,
  });
  if (!hasAuthoredOptionCurve(option.familyId)) return option;
  return {
    ...option,
    roll: optionValueAtLevel(option.familyId, option.rarity, option.level, option.roll, { greater: !!option.greater }),
    optionValueVersion: 2,
  };
}

export function isOption4(value) {
  return !!value
    && value.optionSchemaVersion === OPTION_SCHEMA_VERSION
    && typeof value.familyId === 'string'
    && normalizeOptionLevel(value.level) === value.level;
}

export function optionMaterialEfficiency(targetRarity, materialRarity) {
  const target = Math.max(0, rarityIndex(normalizeOptionRarity(targetRarity)));
  const material = Math.max(0, rarityIndex(normalizeOptionRarity(materialRarity)));
  if (material >= target) return 1;
  const gap = target - material;
  return gap === 1 ? 0.8 : gap === 2 ? 0.6 : gap === 3 ? 0.4 : 0.2;
}
