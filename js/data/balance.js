/* ============================================================
   バランス設定（Blade Vale 2.0 Phase 1）
   ------------------------------------------------------------
   ゲームロジックのコードを書き換えずに数値だけで調整できるよう、
   全レイヤーの主要な倍率・しきい値をここに集約する。
   Phase 1 の時点では既存の数値を「そのまま」ここへ移しただけで、
   ゲームバランス自体は変更していない（構造の整理のみ）。
   ============================================================ */

// ---------------------------------------------------------
// A. キャラクター成長レイヤー
// レベル1時点の素の基礎値／1レベルあたりの素の伸び
// （tier補正・職業profile補正はこの上でjobs.js側が掛け合わせる）
// ---------------------------------------------------------
export const CHARACTER_LAYER = {
  STAT_BASE: { hp: 44, mp: 8, atk: 6, def: 5, mag: 5, spd: 5, crit: 3 },
  STAT_GROWTH: { hp: 4.5, mp: 1.2, atk: 1, def: 1, mag: 1, spd: 0.4, crit: 0.15 },
};

// ---------------------------------------------------------
// B. 職業成長レイヤー（基本→上級→特級→勇者）
// ---------------------------------------------------------
export const JOB_TIER = {
  basic:    { order: 0, changeableLv: 10,   masteryLv: 15,   baseMult: 1.0, growthMult: 1.0 },
  advanced: { order: 1, changeableLv: 20,   masteryLv: 30,   baseMult: 1.5, growthMult: 2.0 },
  special:  { order: 2, changeableLv: 30,   masteryLv: 50,   baseMult: 2.1, growthMult: 3.3 },
  hero:     { order: 3, changeableLv: null, masteryLv: null, baseMult: 3.0, growthMult: 5.3 },
};

// ---------------------------------------------------------
// C. 装備成長レイヤー（武器種・レアリティ・強化・ルーン・武器熟練）
// ---------------------------------------------------------
export const EQUIPMENT_LAYER = {
  RARITY_MULT: { normal: 1.0, rare: 1.6, epic: 2.4, legendary: 3.6, mythic: 5.4 },

  WEAPON_AFFINITY_BONUS: 0.08,      // 得意武器種を装備中、主要ステータスに+8%

  ENHANCE_MAX_LEVEL: 10,
  ENHANCE_BONUS_PER_LEVEL: 0.05,    // 強化+1レベルごとに武器のステータス+5%
  ENHANCE_GOLD_BASE: 30,
  ENHANCE_GOLD_PER_LEVEL: 40,       // cost(level) = BASE + level * PER_LEVEL

  RUNE_SLOT_LEVEL_THRESHOLDS: [3, 6, 9], // このLv到達ごとにルーンスロット+1（初期1、最大4）

  WEAPON_MASTERY_KILLS_REQUIRED: 300,     // その武器種を装備して倒した数。到達で全職業が使用可に

  // スロットごとの基礎威力（章倍率・レアリティ倍率を掛ける前の値）
  BASE_POWER: { weapon: 4, shield: 4, head: 3, body: 4, accessory: 3 },
};

// ---------------------------------------------------------
// D. 転生成長レイヤー
// ---------------------------------------------------------
export const REBIRTH_LAYER = {
  STAT_BONUS_PER_REBIRTH: 0.03,     // 現行：転生1回につき全ステータス+3%（永続・加算）
  GOLD_COST_BASE: 500,
  GOLD_COST_PER_REBIRTH: 800,
  MANASTONE_COST_BASE: 30,
  MANASTONE_COST_PER_REBIRTH: 40,
};

// ---------------------------------------------------------
// 敵スケーリング（章が1つ進むごとの倍率の伸び幅）
// HP/ATK/DEFを別々の定数にしてあるのは、将来の深淵実装で
// 「HPは緩やかに・ATKの危険度は着実に」のように分岐させるため。
// Phase 1時点ではすべて0.35で統一し、現行バランスを完全維持する。
// ---------------------------------------------------------
export const ENEMY_SCALING = {
  CHAPTER_HP_MULT_STEP: 0.35,
  CHAPTER_ATK_MULT_STEP: 0.35,
  CHAPTER_DEF_MULT_STEP: 0.35,
};

// ---------------------------------------------------------
// Damage Bucket
// finalDamage = baseATK（職業+装備+強化+ルーン+適性反映後の最終ATK）
//             × (1 + Σ%ダメージ増加)   ← Phase2以降のMASTER/転生遺物等はここに加算予定
//             × critMultiplier（会心成立時のみ）
//             × (1 - enemyMitigation)  ← 現行は単純減算式。Phase4以降で拡張
//             × specialEffectMultiplier（燃焼/覚醒など、既存の乗算枠）
// カテゴリー内は加算、カテゴリー間だけ乗算する方針。
// ---------------------------------------------------------
export const DAMAGE_BUCKET = {
  CRIT_MULTIPLIER: 1.8,
  DEF_MITIGATION_COEFF: 0.5, // 現行の "atk - def * 0.5" 式の係数
};

// ---------------------------------------------------------
// ドロップ／経済
// ---------------------------------------------------------
export const ECONOMY = {
  BASE_DROP_CHANCE: 0.28,
  MANASTONE_BOSS_MIN: 15,
  MANASTONE_BOSS_MAX: 25,
  MANASTONE_NORMAL_CHANCE: 0.2,
  MANASTONE_NORMAL_MIN: 1,
  MANASTONE_NORMAL_MAX: 3,
};

// ---------------------------------------------------------
// ルーンクラフト
// ---------------------------------------------------------
export const RUNE_TIER_MULT = { small: 1, medium: 2, large: 3 };
export const RUNE_CRAFT_COST = {
  small: { manastone: 10, gold: 50 },
  medium: { manastone: 25, gold: 150 },
  large: { manastone: 60, gold: 400 },
};
