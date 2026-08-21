/* ============================================================
   装備データ定義
   スロット: weapon / shield / head / body / accessory
   レアリティ: normal < rare < epic < legendary
   ============================================================ */

export const RARITY = {
  normal:    { label: 'ノーマル',   color: '#b9c0cc', mult: 1.0 },
  rare:      { label: 'レア',       color: '#4ac2e8', mult: 1.6 },
  epic:      { label: 'エピック',   color: '#b06ef2', mult: 2.4 },
  legendary: { label: 'レジェンド', color: '#f2c94c', mult: 3.6 },
};

// stats はベース値（レアリティ mult が乗算される）
const RAW_ITEMS = [
  // weapon
  { id: 'wp_sword_n', name: '鉄の剣', slot: 'weapon', rarity: 'normal', stats: { atk: 4 } },
  { id: 'wp_sword_r', name: '業物の剣', slot: 'weapon', rarity: 'rare', stats: { atk: 4, crit: 2 } },
  { id: 'wp_sword_e', name: '竜牙の剣', slot: 'weapon', rarity: 'epic', stats: { atk: 4, crit: 2, spd: 1 } },
  { id: 'wp_sword_l', name: '英雄の剣', slot: 'weapon', rarity: 'legendary', stats: { atk: 5, crit: 2, mag: 2 } },
  // shield
  { id: 'sh_wood_n', name: '木の盾', slot: 'shield', rarity: 'normal', stats: { def: 4 } },
  { id: 'sh_iron_r', name: '鉄の盾', slot: 'shield', rarity: 'rare', stats: { def: 4, hp: 6 } },
  { id: 'sh_tower_e', name: '守護の大盾', slot: 'shield', rarity: 'epic', stats: { def: 5, hp: 8 } },
  { id: 'sh_aegis_l', name: '聖盾イージス', slot: 'shield', rarity: 'legendary', stats: { def: 6, hp: 12, mag: 2 } },
  // head
  { id: 'hd_cap_n', name: '革の帽子', slot: 'head', rarity: 'normal', stats: { def: 2, mp: 3 } },
  { id: 'hd_helm_r', name: '鋼鉄の兜', slot: 'head', rarity: 'rare', stats: { def: 3, hp: 4 } },
  { id: 'hd_circlet_e', name: '賢者の輪冠', slot: 'head', rarity: 'epic', stats: { mag: 4, mp: 6 } },
  { id: 'hd_crown_l', name: '王者の冠', slot: 'head', rarity: 'legendary', stats: { atk: 2, def: 2, mag: 2, mp: 6 } },
  // body
  { id: 'bd_cloth_n', name: '布の服', slot: 'body', rarity: 'normal', stats: { def: 3, mp: 2 } },
  { id: 'bd_leather_r', name: '革鎧', slot: 'body', rarity: 'rare', stats: { def: 4, hp: 6 } },
  { id: 'bd_plate_e', name: '重鎧', slot: 'body', rarity: 'epic', stats: { def: 6, hp: 10 } },
  { id: 'bd_dragon_l', name: '竜鱗の鎧', slot: 'body', rarity: 'legendary', stats: { def: 7, hp: 16, mag: 2 } },
  // accessory
  { id: 'ac_ring_n', name: '力の指輪', slot: 'accessory', rarity: 'normal', stats: { atk: 2 } },
  { id: 'ac_amulet_r', name: '守りのお守り', slot: 'accessory', rarity: 'rare', stats: { def: 2, hp: 4 } },
  { id: 'ac_charm_e', name: '幸運のお守り', slot: 'accessory', rarity: 'epic', stats: { crit: 4, spd: 2 } },
  { id: 'ac_relic_l', name: '古の秘宝', slot: 'accessory', rarity: 'legendary', stats: { atk: 3, mag: 3, crit: 3 } },
];

const ITEMS = new Map();
for (const raw of RAW_ITEMS) {
  const mult = RARITY[raw.rarity].mult;
  const stats = {};
  for (const k in raw.stats) stats[k] = Math.round(raw.stats[k] * mult * 10) / 10;
  ITEMS.set(raw.id, { ...raw, stats });
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
  return s;
}

export const SLOTS = ['weapon', 'shield', 'head', 'body', 'accessory1', 'accessory2'];
