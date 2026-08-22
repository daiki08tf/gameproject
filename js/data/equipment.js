/* ============================================================
   装備データ定義
   スロット: weapon / shield / head / body / accessory
   レアリティ: normal < rare < epic < legendary < mythic
   武器種: sword/axe/staff/bow/dagger/knuckle/instrument/rod
   第1章の装備は既存のまま手動定義、第2章以降は chapters.js のメタ
   データから自動生成する。
   ============================================================ */
import { CHAPTER_SPECS, ACCESSORY_ARCHETYPES, EFFECTS, chapterMult } from './chapters.js';
import { EQUIPMENT_LAYER } from './balance.js';

export const RARITY = {
  normal:    { label: 'ノーマル',   color: '#b9c0cc', mult: EQUIPMENT_LAYER.RARITY_MULT.normal },
  rare:      { label: 'レア',       color: '#4ac2e8', mult: EQUIPMENT_LAYER.RARITY_MULT.rare },
  epic:      { label: 'エピック',   color: '#b06ef2', mult: EQUIPMENT_LAYER.RARITY_MULT.epic },
  legendary: { label: 'レジェンド', color: '#f2c94c', mult: EQUIPMENT_LAYER.RARITY_MULT.legendary },
  mythic:    { label: '神話',       color: '#ff6ec7', mult: EQUIPMENT_LAYER.RARITY_MULT.mythic },
};

// レアリティの序列（Loot Filterのしきい値判定などで使用）
export const RARITY_ORDER = Object.keys(RARITY);
export function rarityIndex(rarity) { return RARITY_ORDER.indexOf(rarity); }

// 武器種：メインステータスへの配分比率。affinityStat と職業の得意武器が
// 一致すると装備適性ボーナス(+8%)が付く
export const WEAPON_TYPES = {
  sword:      { name: '剣',   atk: 1.4, mag: 0.2, spd: 0.6, crit: 1.0, affinityStat: 'atk' },
  axe:        { name: '斧',   atk: 1.8, mag: 0.1, spd: 0.3, crit: 0.6, affinityStat: 'atk' },
  staff:      { name: '杖',   atk: 0.2, mag: 1.8, spd: 0.4, crit: 0.6, affinityStat: 'mag' },
  bow:        { name: '弓',   atk: 1.2, mag: 0.2, spd: 1.0, crit: 1.2, affinityStat: 'atk' },
  dagger:     { name: '短剣', atk: 0.9, mag: 0.2, spd: 1.3, crit: 1.6, affinityStat: 'atk' },
  knuckle:    { name: '拳具', atk: 1.3, mag: 0.2, spd: 1.2, crit: 1.1, affinityStat: 'atk' },
  instrument: { name: '楽器', atk: 0.3, mag: 1.3, spd: 0.8, crit: 0.6, affinityStat: 'mag' },
  rod:        { name: '錫杖', atk: 0.3, mag: 1.4, spd: 0.4, crit: 0.5, affinityStat: 'mag' },
};
const AFFINITY_BONUS = EQUIPMENT_LAYER.WEAPON_AFFINITY_BONUS;
// この体数を装備して倒すと、その武器種は全職業で使えるようになる
export const WEAPON_MASTERY_THRESHOLD = EQUIPMENT_LAYER.WEAPON_MASTERY_KILLS_REQUIRED;

const BASE_POWER = EQUIPMENT_LAYER.BASE_POWER;
const SLOT_TEMPLATE = {
  shield: { def: 1.0, hp: 1.5 },
  head: { def: 0.6, mag: 0.5, mp: 1.0 },
  body: { def: 1.0, hp: 2.0 },
};

function roundStats(stats) {
  const out = {};
  for (const k in stats) out[k] = Math.round(stats[k] * 10) / 10;
  return out;
}

// ---------------------------------------------------------
// 第1章：既存装備（手動定義・変更なし）
// ---------------------------------------------------------
const RAW_ITEMS = [
  { id: 'wp_sword_n', name: '鉄の剣', slot: 'weapon', weaponType: 'sword', rarity: 'normal', stats: { atk: 4 } },
  { id: 'wp_sword_r', name: '業物の剣', slot: 'weapon', weaponType: 'sword', rarity: 'rare', stats: { atk: 4, crit: 2 } },
  { id: 'wp_sword_e', name: '竜牙の剣', slot: 'weapon', weaponType: 'sword', rarity: 'epic', stats: { atk: 4, crit: 2, spd: 1 } },
  { id: 'wp_sword_l', name: '英雄の剣', slot: 'weapon', weaponType: 'sword', rarity: 'legendary', stats: { atk: 5, crit: 2, mag: 2 } },
  { id: 'sh_wood_n', name: '木の盾', slot: 'shield', rarity: 'normal', stats: { def: 4 } },
  { id: 'sh_iron_r', name: '鉄の盾', slot: 'shield', rarity: 'rare', stats: { def: 4, hp: 6 } },
  { id: 'sh_tower_e', name: '守護の大盾', slot: 'shield', rarity: 'epic', stats: { def: 5, hp: 8 } },
  { id: 'sh_aegis_l', name: '聖盾イージス', slot: 'shield', rarity: 'legendary', stats: { def: 6, hp: 12, mag: 2 } },
  { id: 'hd_cap_n', name: '革の帽子', slot: 'head', rarity: 'normal', stats: { def: 2, mp: 3 } },
  { id: 'hd_helm_r', name: '鋼鉄の兜', slot: 'head', rarity: 'rare', stats: { def: 3, hp: 4 } },
  { id: 'hd_circlet_e', name: '賢者の輪冠', slot: 'head', rarity: 'epic', stats: { mag: 4, mp: 6 } },
  { id: 'hd_crown_l', name: '王者の冠', slot: 'head', rarity: 'legendary', stats: { atk: 2, def: 2, mag: 2, mp: 6 } },
  { id: 'bd_cloth_n', name: '布の服', slot: 'body', rarity: 'normal', stats: { def: 3, mp: 2 } },
  { id: 'bd_leather_r', name: '革鎧', slot: 'body', rarity: 'rare', stats: { def: 4, hp: 6 } },
  { id: 'bd_plate_e', name: '重鎧', slot: 'body', rarity: 'epic', stats: { def: 6, hp: 10 } },
  { id: 'bd_dragon_l', name: '竜鱗の鎧', slot: 'body', rarity: 'legendary', stats: { def: 7, hp: 16, mag: 2 } },
  { id: 'ac_ring_n', name: '力の指輪', slot: 'accessory', rarity: 'normal', stats: { atk: 2 } },
  { id: 'ac_amulet_r', name: '守りのお守り', slot: 'accessory', rarity: 'rare', stats: { def: 2, hp: 4 } },
  { id: 'ac_charm_e', name: '幸運のお守り', slot: 'accessory', rarity: 'epic', stats: { crit: 4, spd: 2 } },
  { id: 'ac_relic_l', name: '古の秘宝', slot: 'accessory', rarity: 'legendary', stats: { atk: 3, mag: 3, crit: 3 } },
  { id: 'ac_valley_e', name: '隠し谷の指輪', slot: 'accessory', rarity: 'epic', stats: { atk: 3, def: 3, hp: 8 } },
];

const ITEMS = new Map();
for (const raw of RAW_ITEMS) {
  const mult = RARITY[raw.rarity].mult;
  const stats = {};
  for (const k in raw.stats) stats[k] = Math.round(raw.stats[k] * mult * 10) / 10;
  ITEMS.set(raw.id, { ...raw, stats });
}

// ---------------------------------------------------------
// 第2章以降：chapters.js のメタデータから自動生成
// ---------------------------------------------------------
function makeWeaponStats(weaponType, rarity, chapterNum) {
  const wt = WEAPON_TYPES[weaponType];
  const power = BASE_POWER.weapon * RARITY[rarity].mult * chapterMult(chapterNum);
  return roundStats({ atk: wt.atk * power, mag: wt.mag * power, spd: wt.spd * power, crit: wt.crit * power });
}
function makeSlotStats(slot, rarity, chapterNum) {
  const tmpl = SLOT_TEMPLATE[slot];
  const power = BASE_POWER[slot] * RARITY[rarity].mult * chapterMult(chapterNum);
  const stats = {};
  for (const k in tmpl) stats[k] = tmpl[k] * power;
  return roundStats(stats);
}
function makeAccessoryStats(archetype, rarity, chapterNum) {
  const tmpl = ACCESSORY_ARCHETYPES[archetype];
  const power = BASE_POWER.accessory * RARITY[rarity].mult * chapterMult(chapterNum);
  const stats = {};
  for (const k in tmpl) stats[k] = tmpl[k] * power;
  return roundStats(stats);
}

for (const ch of CHAPTER_SPECS) {
  const it = ch.items;
  const rarity = ch.final ? 'mythic' : 'legendary';
  const namedRarity = ch.final ? 'mythic' : 'legendary';

  ITEMS.set(`${ch.id}_weapon`, {
    id: `${ch.id}_weapon`, name: it.weapon, slot: 'weapon', weaponType: ch.weaponType, rarity: 'rare',
    stats: makeWeaponStats(ch.weaponType, 'rare', ch.num),
  });
  ITEMS.set(`${ch.id}_shield`, {
    id: `${ch.id}_shield`, name: it.shield, slot: 'shield', rarity: 'rare',
    stats: makeSlotStats('shield', 'rare', ch.num),
  });
  ITEMS.set(`${ch.id}_head`, {
    id: `${ch.id}_head`, name: it.head, slot: 'head', rarity: 'rare',
    stats: makeSlotStats('head', 'rare', ch.num),
  });
  ITEMS.set(`${ch.id}_body`, {
    id: `${ch.id}_body`, name: it.body, slot: 'body', rarity: 'rare',
    stats: makeSlotStats('body', 'rare', ch.num),
  });
  ITEMS.set(`${ch.id}_accessory`, {
    id: `${ch.id}_accessory`, name: it.accessory, slot: 'accessory', rarity: 'rare',
    stats: makeAccessoryStats(it.accessoryArchetype, 'rare', ch.num),
  });
  ITEMS.set(`${ch.id}_weapon_epic`, {
    id: `${ch.id}_weapon_epic`, name: it.weaponEpic, slot: 'weapon', weaponType: ch.weaponType, rarity: 'epic',
    stats: makeWeaponStats(ch.weaponType, 'epic', ch.num),
  });

  const buildNamed = (spec) => {
    const slot = spec.slot;
    const baseStats = slot === 'weapon'
      ? makeWeaponStats(ch.weaponType, namedRarity, ch.num)
      : slot === 'accessory'
        ? makeAccessoryStats(it.accessoryArchetype, namedRarity, ch.num)
        : makeSlotStats(slot, namedRarity, ch.num);
    return {
      id: `${ch.id}_named_${slot}`, name: spec.name, slot,
      weaponType: slot === 'weapon' ? ch.weaponType : undefined,
      rarity: namedRarity, stats: baseStats, effects: [EFFECTS[spec.effect]],
    };
  };
  ITEMS.set(`${ch.id}_named_${it.named.slot}`, buildNamed(it.named));
  if (it.named2) ITEMS.set(`${ch.id}_named2_${it.named2.slot}`, buildNamed(it.named2));

  if (ch.branch) {
    const branchRarity = ch.final ? 'legendary' : 'epic';
    ITEMS.set(`${ch.id}_branch`, {
      id: `${ch.id}_branch`, name: ch.branch.itemName, slot: 'accessory', rarity: branchRarity,
      stats: makeAccessoryStats(it.accessoryArchetype, branchRarity, ch.num),
    });
  }
}

export function getItem(id) { return ITEMS.get(id); }
export function allItems() { return Array.from(ITEMS.values()); }
export function itemsBySlot(slot) { return allItems().filter((i) => i.slot === slot); }

// 装備の「戦闘力」スコア（最強装備ボタンの比較に使用）
export function powerScore(item) {
  if (!item) return 0;
  const w = { hp: 0.5, mp: 0.5, atk: 2, def: 2, mag: 2, spd: 1.5, crit: 1.5 };
  let s = 0;
  for (const k in item.stats) s += (item.stats[k] || 0) * (w[k] || 1);
  if (item.effects && item.effects.length) s += 15 * item.effects.length; // 特殊効果分のボーナス評価
  return s;
}

// 職業の得意武器と装備中の武器タイプが一致する場合の適性ボーナス倍率
export function weaponAffinityBonus(weaponItem, jobWeaponType) {
  if (!weaponItem || !weaponItem.weaponType) return null;
  if (weaponItem.weaponType !== jobWeaponType) return null;
  const wt = WEAPON_TYPES[weaponItem.weaponType];
  return { stat: wt.affinityStat, mult: 1 + AFFINITY_BONUS };
}

export const SLOTS = ['weapon', 'shield', 'head', 'body', 'accessory1', 'accessory2'];

// 武器強化レベルに応じたルーンスロット数
export function slotsForEnhanceLevel(level) {
  const [t1, t2, t3] = EQUIPMENT_LAYER.RUNE_SLOT_LEVEL_THRESHOLDS;
  if (level >= t3) return 4;
  if (level >= t2) return 3;
  if (level >= t1) return 2;
  return 1;
}
