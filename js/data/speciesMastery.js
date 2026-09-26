/* ============================================================
   Species Mastery（種族熟練）— Session 6
   ------------------------------------------------------------
   「その種族をどれだけ知っているか」を個体Lv・絆Lvとは別に積む
   種族単位の長期進行。

   蓄積（全て既存のイベントから派生 — 新しい入力経路は作らない）:
     撃破        +1   （Elite +2 / Rare系統 +4 / Roamer +5 / Denlord +6）
     勧誘成功    +12  （勧誘に失敗しても撃破分の熟練は残る＝報われない
                       遭遇を作らない）
     出撃勝利    +2   （その種族の仲間がPTにいるとき、戦闘クリアごと）

   熟練Lv（累計EXP → 段階）:
     Lv1 8 / Lv2 24 / Lv3 56 / Lv4 110 / Lv5 200（上限）

   恩恵（全て有界・勧誘とPT強度の小さな縁を固めるだけ）:
     勧誘率      種族熟練Lv × +4%（上限+20%）… その種との出会いを
                「知っているほど口説きやすい」として表現
     仲間能力    熟練Lv × +1.5% の全ステ小倍率（上限+7.5%）
                … 個体Lv・絆Lv・進化とは別系統の、小さな上積み
     情報        熟練Lv3でCodexの種族欄に「精通」、Lv5で「極み」の印
   ------------------------------------------------------------
   セーブ形状: state.data.speciesMastery[speciesId] = {exp,kills,recruits}
   additive field — 既存saveには存在しないので初アクセス時に初期化。
   ============================================================ */

export const SPECIES_MASTERY = Object.freeze({
  MAX_LEVEL: 5,
  TIER_XP: Object.freeze([0, 8, 24, 56, 110, 200]), // index = level
  KILL_XP: 1,
  ELITE_XP: 2,
  RARE_XP: 4,
  ROAMER_XP: 5,
  DENLORD_XP: 6,
  RECRUIT_XP: 12,
  PARTY_CLEAR_XP: 2,
  RECRUIT_BONUS_PER_LEVEL: 0.04,
  STAT_MULT_PER_LEVEL: 0.015,
});

// 累計EXPから熟練Lvを導く（0..5）。
export function speciesMasteryLevelFor(exp) {
  const e = Number(exp) || 0;
  let level = 0;
  for (let lv = 1; lv <= SPECIES_MASTERY.MAX_LEVEL; lv++) {
    if (e >= SPECIES_MASTERY.TIER_XP[lv]) level = lv;
  }
  return level;
}

// 撃破した敵が種族熟練に載る対象なら、付与すべきEXP量を返す。
// 勧誘可能種だけを追う（勧誘不可能な一般敵は種族知識の対象外）。
export function speciesMasteryKillXp(enemy) {
  if (!enemy) return 0;
  if (enemy.roamerId) return SPECIES_MASTERY.ROAMER_XP;
  if (enemy.denlordPrestige) return SPECIES_MASTERY.DENLORD_XP;
  if (enemy.rank === 'rare' || enemy.rareIdentity) return SPECIES_MASTERY.RARE_XP;
  if (enemy.elite) return SPECIES_MASTERY.ELITE_XP;
  return SPECIES_MASTERY.KILL_XP;
}

export function speciesMasteryTierLabel(level) {
  if (level >= 5) return '極み';
  if (level >= 3) return '精通';
  if (level >= 1) return '知見';
  return '';
}
