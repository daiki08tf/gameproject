/* ============================================================
   Item Rank（アイテム位階）— Session 7 / Loot Evolution 2.0
   ------------------------------------------------------------
   武器インスタンスがドロップ時に持つ「位階」。アイテム定義の
   rarity（図鑑上の等級）とは別に、その一本だけが抽選で
   上位の位階を帯びることがある。

     ITEM RARITY … アイテム定義の等級（カタログの一貫性）
     ITEM RANK   … その個体が「どれほどの拾いものか」（ドロップの興奮）
     AFFIX RARITY… 各Affixの等級（生成時の抽選）

   位階は instance.rank に保存（= catalog rarity と同じなら保存しない
   ＝additive field。旧セーブのインスタンスは全て無印＝そのまま正常）。

   「位階はドロップが生む」——鍛冶・強化・覚醒は位階を変えない。
   （DROP CREATES THE ITEM. FORGING IMPROVES THE ITEM.）
   ============================================================ */
import { RARITY } from './equipment.js';

// 位階の並び（item.rarity の上位2位を追加する拡張梯子）
export const ITEM_RANKS = Object.freeze(['normal', 'rare', 'epic', 'legendary', 'mythic', 'relic', 'primordial']);
export const ITEM_RANK_LABEL = Object.freeze({
  relic: '遺物級',
  primordial: '原初級',
});
export const ITEM_RANK_COLOR = Object.freeze({
  relic: '#8be8c8',
  primordial: '#ffd9a0',
});

export function itemRankIndex(rank) {
  const i = ITEM_RANKS.indexOf(rank);
  return i < 0 ? 0 : i;
}
// instance.rank（昇格時のみ）→ 表示・計算に使う実効位階。
export function effectiveItemRank(item, instance) {
  return instance?.rank || item?.rarity || 'normal';
}
// 実効位階の基礎stat倍率（= 図鑑等級に対する昇格差分。同格なら1）。
export function itemRankStatMult(item, instance) {
  const base = RARITY[item?.rarity]?.mult || 1;
  const eff = RARITY[effectiveItemRank(item, instance)]?.mult || base;
  return eff / base;
}
export function itemRankLabel(rank) {
  return ITEM_RANK_LABEL[rank] || RARITY[rank]?.label || null;
}
export function itemRankColor(rank) {
  return ITEM_RANK_COLOR[rank] || RARITY[rank]?.color || null;
}

/* ------------------------------------------------------------
   位階抽選 — ドロップ時のみ呼ぶ。ctx は affix生成と同じ
   { depth, elite, boss, bonus } に加え、stageの高位階補正
   ctx.rankBonus（秘密の狩場・再臨・最深部など）を読む。

   設計の均衡:
   - 通常ドロップはほぼ素の等級（たまに+1で「運が良かった」）
   - relic以上は「狩り場を選んだ」文脈（boss/elite/深淵深部/秘密補正）
     がなければほぼ出ない
   - primordialは最上位ソースにだけ残る「何が起きたのか分からない」枠
   ------------------------------------------------------------ */
export const ITEM_RANK_ROLL = Object.freeze({
  PLUS_ONE_BASE: 0.06,
  PLUS_ONE_ELITE: 0.10,
  PLUS_ONE_BOSS: 0.18,
  PLUS_ONE_DEPTH_DIV: 400, // depth/400、最大+0.12まで積む
  PLUS_ONE_DEPTH_CAP: 0.12,
  PLUS_TWO_BASE: 0.015,
  PLUS_TWO_BOSS: 0.03,
  PRIMORDIAL_BASE: 0.0015,
  PRIMORDIAL_RANK_MULT: 0.02,
});

export function rollItemRank(item, ctx = {}) {
  if (!item || item.slot !== 'weapon') return item?.rarity || 'normal';
  const baseIdx = itemRankIndex(item.rarity);
  const maxIdx = ITEM_RANKS.length - 1;
  if (baseIdx >= maxIdx) return item.rarity;
  const R = ITEM_RANK_ROLL;
  const depth = Number(ctx.depth) || 0;
  const rankBonus = Math.max(0, Number(ctx.rankBonus) || 0);

  const p1 = R.PLUS_ONE_BASE
    + (ctx.elite ? R.PLUS_ONE_ELITE : 0)
    + (ctx.boss ? R.PLUS_ONE_BOSS : 0)
    + Math.min(R.PLUS_ONE_DEPTH_CAP, depth / R.PLUS_ONE_DEPTH_DIV)
    + rankBonus;
  let step = Math.random() < p1 ? 1 : 0;

  // +2（relic帯）は「狩り場を選んだ」文脈が必須。
  const eliteContext = !!ctx.boss || !!ctx.elite || depth >= 40 || rankBonus >= 0.06;
  if (eliteContext && baseIdx + step < maxIdx - 1) {
    const p2 = R.PLUS_TWO_BASE + (ctx.boss ? R.PLUS_TWO_BOSS : 0) + rankBonus * 0.4;
    if (Math.random() < p2) step += 1;
  }
  // primordial：最深の狩場にだけ残る極小枠。
  const primordialContext = depth >= 80 || rankBonus >= 0.08;
  if (primordialContext && Math.random() < R.PRIMORDIAL_BASE + rankBonus * R.PRIMORDIAL_RANK_MULT) {
    return ITEM_RANKS[maxIdx];
  }
  return ITEM_RANKS[Math.min(maxIdx, baseIdx + step)];
}
