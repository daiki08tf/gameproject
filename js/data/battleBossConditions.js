/* ============================================================
   ボスの隠し条件 — EXPANSION A2 / ロードマップ C11
   ------------------------------------------------------------
   本編 1〜15 章の章ボスに 1 つずつ「こう倒すと追加で得られる」条件を置く。
   条件は出撃確認画面に最初から文章で出す（攻略情報なしで読める、が C11 の方針）。

   - 既存の phase13（自己ベスト・Build Feat・称号）は「記録と称号」で、品は落ちない。
     こちらは一度きりの報酬で、重複しない。
   - 判定に使うのは、その戦闘の BattleEngine の値だけ（ラウンド数・残 HP・仲間の生存・どうぐ使用回数）。
   - 報酬は既存のもの：地域の最後のボスは T2 の地域固有装備を確定で、それ以外は魔石と Gold。
     固有装備は通常どおり巡回でも落ちるので、ここは「運に頼らない入手ルート」を足すだけ。
   - 受け取り記録は既存の state.data.claimedMilestones（実行時パッチ側）。
   ============================================================ */
import { WORLD3_REGIONS, world3RegionForChapter } from './world3Regions.js';
import { huntUniquesForRegion } from './huntUniques.js';

export const BOSS_CONDITION_TYPES = Object.freeze({
  rounds: { label: (c) => `${c.limit}ラウンド以内に撃破する`, met: (c, r) => r.rounds <= c.limit, detail: (c, r) => `${r.rounds}ラウンド` },
  noItems: { label: () => 'どうぐを使わずに撃破する', met: (c, r) => r.itemsUsed === 0, detail: (c, r) => `どうぐ ${r.itemsUsed}回` },
  highHp: { label: (c) => `HPを${Math.round(c.ratio * 100)}%以上残して撃破する`, met: (c, r) => r.hpRatio >= c.ratio, detail: (c, r) => `残HP ${Math.round(r.hpRatio * 100)}%` },
  companions: { label: () => '仲間を一人も倒されずに撃破する', met: (c, r) => r.companionsDown === 0, detail: (c, r) => `戦闘不能 ${r.companionsDown}体` },
});

const ROTATION = ['rounds', 'noItems', 'highHp', 'companions'];
const LAST_CHAPTER = 15; // 定命 4 地域（T2 の固有装備がある範囲）

// stageId（'N-M'）と stage を受け取り、その章ボスの条件を返す。対象外なら null。
export function bossConditionFor(stage) {
  const m = /^(\d+)-(\d+)$/.exec(String(stage?.id || ''));
  if (!m || !stage.boss || stage.branch) return null;
  const chapter = Number(m[1]);
  if (chapter < 1 || chapter > LAST_CHAPTER) return null;
  // 地域の最後のボス（4・8・12 章…）が同じ条件に揃わないよう、地域が進むごとに 1 つずらす
  const type = ROTATION[(chapter - 1 + Math.floor((chapter - 1) / 4)) % ROTATION.length];
  const cond = { stageId: stage.id, chapter, type, limit: 16, ratio: 0.5 };
  const region = world3RegionForChapter(chapter);
  const lastOfRegion = !!region && Math.max(...region.chapters.filter((n) => n <= LAST_CHAPTER)) === chapter;
  const unique = lastOfRegion ? huntUniquesForRegion(region.id)[0] || null : null;
  cond.reward = unique
    ? { itemId: unique.id, itemName: unique.name }
    : { manastone: 20 + chapter * 10, gold: 150 * chapter };
  cond.label = BOSS_CONDITION_TYPES[type].label(cond);
  cond.rewardText = unique ? `${region.name}の固有装備` : `魔石 +${cond.reward.manastone} / Gold +${cond.reward.gold}`;
  return cond;
}

// r: { rounds, itemsUsed, hpRatio, companionsDown }
export function evaluateBossCondition(cond, r) {
  const def = cond && BOSS_CONDITION_TYPES[cond.type];
  if (!def || !r) return null;
  return { met: !!def.met(cond, r), detail: def.detail(cond, r) };
}

export function bossConditionClaimId(stageId) { return `bosscond:${stageId}`; }
export const BOSS_CONDITION_REGIONS = WORLD3_REGIONS.filter((r) => r.chapters.some((n) => n <= LAST_CHAPTER)).map((r) => r.id);
