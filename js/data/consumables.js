/* ============================================================
   Consumables（どうぐ）— battle-usable consumable items.

   These are NOT equipment: they never enter the ITEMS registry, they
   have no slot, and they are identified purely by id prefix
   ('item_'). Stock lives in the existing state.data.inventory map,
   so no save-schema change is needed — an old save simply has none.

   Acquisition:
     - Blacksmith「道具」tab (Gold purchase — gives Gold an early sink)
     - Post-kill drops (BattleEngine._rollConsumableDrop)

   Usage:
     - BattleEngine command { type: 'item', itemId } — resolved before
       the enemy phase regardless of initiative, for the same reason
       guard is: an item you chose this round must protect/heal you
       against this round's incoming damage.
   ============================================================ */

export const CONSUMABLES = {
  item_herb: {
    id: 'item_herb', name: 'やくそう', price: 30,
    desc: 'HPを35%回復する',
    effect: { kind: 'heal', pct: 0.35 },
  },
  item_hiherb: {
    id: 'item_hiherb', name: '上やくそう', price: 120,
    desc: 'HPを70%回復する',
    effect: { kind: 'heal', pct: 0.70 },
  },
  item_ether: {
    id: 'item_ether', name: 'まほうの水', price: 50,
    desc: 'MPを50%回復する',
    effect: { kind: 'mp', pct: 0.50 },
  },
  item_bell: {
    id: 'item_bell', name: '浄化の鈴', price: 70,
    desc: '敵に受けた弱体効果をすべて打ち消す',
    effect: { kind: 'cleanse' },
  },
  item_warcry: {
    id: 'item_warcry', name: '闘気の丸薬', price: 90,
    desc: '3ターンの間、攻撃力が30%上がる',
    effect: { kind: 'buff', stat: 'atk', pct: 0.30, turns: 3 },
  },
  item_ironwall: {
    id: 'item_ironwall', name: '鉄壁の護符', price: 90,
    desc: '3ターンの間、防御力が40%上がる',
    effect: { kind: 'buff', stat: 'def', pct: 0.40, turns: 3 },
  },
  item_lure: {
    id: 'item_lure', name: '匂い袋', price: 140,
    desc: 'この戦闘中、Rareと「名もなき強敵」の出現率が上がる',
    effect: { kind: 'lure' },
  },
};

export function getConsumable(id) {
  return CONSUMABLES[id] || null;
}

export function isConsumable(id) {
  return !!CONSUMABLES[id];
}

// 撃破ドロップ用の重み付きテーブル。回復系を厚く、戦闘バフ系を
// 薄めに（貴重な選択肢として機能するように）。
export const CONSUMABLE_DROP_TABLE = [
  { itemId: 'item_herb', weight: 45 },
  { itemId: 'item_ether', weight: 20 },
  { itemId: 'item_hiherb', weight: 12 },
  { itemId: 'item_bell', weight: 10 },
  { itemId: 'item_warcry', weight: 7 },
  { itemId: 'item_ironwall', weight: 6 },
  { itemId: 'item_lure', weight: 5 },
];

// 敵1体撃破ごとのどうぐドロップ抽選確率
export const CONSUMABLE_DROP_CHANCE = 0.07;

// 鍛冶屋「道具」タブの品揃え（陳列順＝この配列順）
export const CONSUMABLE_SHOP = [
  'item_herb', 'item_hiherb', 'item_ether', 'item_bell', 'item_warcry', 'item_ironwall', 'item_lure',
];

export function pickConsumableDrop() {
  const total = CONSUMABLE_DROP_TABLE.reduce((s, d) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const d of CONSUMABLE_DROP_TABLE) {
    r -= d.weight;
    if (r <= 0) return d.itemId;
  }
  return CONSUMABLE_DROP_TABLE[0].itemId;
}
