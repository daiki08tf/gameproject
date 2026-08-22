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

// ---------------------------------------------------------
// E. 職業MASTER（Blade Vale 2.0 Phase 2）
// これまでの「mastered」は上級職解放の判定にしか使われていなかった。
// Phase 2からは、マスター済み職業1つにつき全ステータスへ永続加算される
// 恒久ボーナスを付与する（tier が高いほど1つあたりの恩恵も大きい）。
// このボーナスは覚醒（下記）でリセットされない。
// ---------------------------------------------------------
export const JOB_MASTER_LAYER = {
  STAT_BONUS_PCT: { basic: 0.01, advanced: 0.02, special: 0.04 },
};

// ---------------------------------------------------------
// F. 覚醒（Reincarnation 2.0 / プレステージリセット、Phase 2）
// 既存の「転生」（専用画面、加算のみ・非破壊）とは別の、もう一段上のシステム。
//   - リセットする物：全職業のレベル・経験値のみ
//   - 絶対に失わない物：装備・所持品・ゴールド・魔石・マスター済み職業・
//     武器熟練度・既存の転生回数・ステージ進行（＝ここまでの「死んでも
//     何も失わない」という大原則は覚醒でも変えない）
//   - 見返り：覚醒ポイントを獲得し、覚醒ツリー（永続・覚醒しても失わない）
//     に投資できる
// ---------------------------------------------------------
export const AWAKENING_LAYER = {
  MIN_LEVEL_TO_AWAKEN: 50,     // 保持中の職業の最高レベルがこれ以上で覚醒可能
  POINTS_PER_LEVEL_DIVISOR: 10, // 獲得覚醒ポイント = floor(最高レベル / この値)
  NODE_COST_BASE: 3,
  NODE_COST_PER_RANK: 2,        // ノードのコスト(rank) = BASE + rank * PER_RANK
  NODE_MAX_RANK: 5,
};

// ---------------------------------------------------------
// G. 目覚めた装備（Phase 3）
// 武器強化がMAXに達し、かつ1回以上覚醒した後にのみ、覚醒ポイントを
// 使って武器をさらに強化できる（強化+10とは別枠の追加ボーナス）。
// ---------------------------------------------------------
export const AWAKENED_EQUIP_LAYER = {
  REQUIRE_ENHANCE_LEVEL: 10,   // この強化レベルに達していないと目覚めさせられない
  REQUIRE_AWAKENINGS: 1,       // プレイヤー自身が最低1回は覚醒している必要がある
  MAX_RANK: 3,
  COST_BASE: 8,
  COST_PER_RANK: 6,            // コスト(rank) = BASE + rank * PER_RANK
  BONUS_PER_RANK: 0.08,        // 武器の付与ステータスに対して、強化ボーナスとは別に+8%/rank
};

// ---------------------------------------------------------
// H. 覚醒アーティファクト（秘宝、Phase 3）
// 既存の特殊効果（EFFECTS）を、ボスドロップのルーンとは別ルートで
// 恒久解放できる仕組み。解放は永続で、スロットに自由に付け替えられる。
// ---------------------------------------------------------
export const ARTIFACT_LAYER = {
  SLOT_UNLOCK_AWAKENINGS: [1, 3, 6], // 覚醒回数がこの値に達するごとにスロット+1（最大3）
  UNLOCK_COST_BASE: 10,
  UNLOCK_COST_PER_ARTIFACT: 8,  // N個目（0始まり）の解放コスト = BASE + N * PER_ARTIFACT
};

// ---------------------------------------------------------
// I. 深淵（Abyss、Phase 4）
// 全10章のボスを撃破すると解放される、無限に深くなるエンドコンテンツ。
// 第10章の強さ（chapterMult(10)）を起点に、章とは別の刻み幅でさらに
// 敵を強くしていく。HP/ATK/DEFで刻み幅を分けているのは、Phase 1で
// 「将来の深淵実装でHPは緩やかに・ATKの危険度は着実に、のように
// 分岐させる」ためにあえて分離しておいた設計をここで実際に使うため。
// 踏破記録（最高到達階）は永続保存・非破壊（下がることはない）。
// ---------------------------------------------------------
export const ABYSS_LAYER = {
  HP_STEP: 0.05,
  ATK_STEP: 0.06,
  DEF_STEP: 0.045,
  REWARD_STEP: 0.05,       // gold/exp/xpの深淵内での伸び幅（章10到達値を基準に）
  BOSS_FLOOR_INTERVAL: 5,  // この階数ごとにボスフロア
  BOSS_REWARD_MULT: 2.5,   // ボスフロアの追加報酬倍率
};
