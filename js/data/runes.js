/* ============================================================
   ルーンデータ定義
   ・ステータスルーン：魔石＋ゴールドで鍛冶屋にてクラフト可能
   ・効果ルーン：各章のボスステージ限定ドロップ（固有装備と同じ効果を再利用）
   ============================================================ */
import { EFFECTS } from './chapters.js';
import { RUNE_TIER_MULT, RUNE_CRAFT_COST } from './balance.js';

const TIER_LABEL = { small: '小', medium: '中', large: '大' };

// 倍率・クラフトコストは js/data/balance.js に集約。ここでは表示ラベルと結合するだけ
export const STAT_RUNE_TIERS = {};
for (const tierId in RUNE_TIER_MULT) {
  STAT_RUNE_TIERS[tierId] = {
    label: TIER_LABEL[tierId],
    mult: RUNE_TIER_MULT[tierId],
    manastone: RUNE_CRAFT_COST[tierId].manastone,
    gold: RUNE_CRAFT_COST[tierId].gold,
  };
}

// 各ステータスの「小」1個あたりの基準値（中=×2、大=×3）
const STAT_RUNE_BASE = { atk: 3, def: 3, hp: 8, mag: 3, spd: 2, crit: 2 };
const STAT_LABEL = { atk: 'ATK', def: 'DEF', hp: 'HP', mag: 'MAG', spd: 'SPD', crit: 'CRIT' };

const RUNES = new Map();

for (const stat in STAT_RUNE_BASE) {
  for (const tierId in STAT_RUNE_TIERS) {
    const tier = STAT_RUNE_TIERS[tierId];
    const id = `rune_${stat}_${tierId}`;
    RUNES.set(id, {
      id, kind: 'stat', stat,
      name: `${STAT_LABEL[stat]}のルーン（${tier.label}）`,
      value: STAT_RUNE_BASE[stat] * tier.mult,
      craftCost: { manastone: tier.manastone, gold: tier.gold },
      craftable: true,
    });
  }
}

// 効果ルーン：ボスドロップ専用（クラフト不可）
for (const effectId in EFFECTS) {
  const eff = EFFECTS[effectId];
  const id = `rune_effect_${effectId}`;
  RUNES.set(id, {
    id, kind: 'effect', effectId,
    name: `${eff.name}のルーン`,
    desc: eff.desc,
    craftable: false,
  });
}

export function getRune(id) { return RUNES.get(id); }
export function allRunes() { return Array.from(RUNES.values()); }
export function craftableRunes() { return allRunes().filter((r) => r.craftable); }
