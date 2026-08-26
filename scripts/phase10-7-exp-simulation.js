import { cumulativeCharacterExpToLevel, CHARACTER_LEVEL_MAX } from '../js/data/progression.js';
import { abyssRecommendedLevel, abyssStageExpBudget } from '../js/data/abyssEndgame.js';

export const STORY_EXP_CHECKPOINTS = Object.freeze([
  [1,1,15],[2,15,30],[3,30,45],[4,45,65],[5,65,90],[6,90,120],[7,120,150],[8,150,180],[9,180,230],[10,230,300],
  [11,300,360],[12,360,430],[13,430,510],[14,510,600],[15,600,700],[16,700,1000],[17,1000,1350],[18,1350,1750],[19,1750,2250],[20,2250,3000],
]);

export const ONE_PASS_TARGET_SHARE = 0.85;

export function levelFromTotalExp(totalExp) {
  const exp = Math.max(0, Number(totalExp) || 0);
  let lo = 1, hi = CHARACTER_LEVEL_MAX;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (cumulativeCharacterExpToLevel(mid) <= exp) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function simulateStory() {
  let totalExp = 0;
  return STORY_EXP_CHECKPOINTS.map(([chapter,min,target]) => {
    const startExp = cumulativeCharacterExpToLevel(min);
    if (totalExp < startExp) totalExp = startExp;
    const targetExp = cumulativeCharacterExpToLevel(target);
    const need = targetExp - startExp;
    const onePassExp = Math.round(need * ONE_PASS_TARGET_SHARE);
    totalExp += onePassExp;
    const row = {
      chapter,
      min,
      target,
      onePassExp,
      endLevel: levelFromTotalExp(totalExp),
      remainingExp: Math.max(0, targetExp - totalExp),
      targetShare: need > 0 ? onePassExp / need : 1,
    };
    // The roadmap intentionally leaves about 15% for branches, gear farming,
    // bounties and retries before the next chapter target is considered complete.
    totalExp = targetExp;
    return row;
  });
}

export function simulateAbyss(checkpoints=[1,100,500,1000,2000,3000]) {
  return checkpoints.map(depth=>({
    depth,
    recommendedLevel:abyssRecommendedLevel(depth),
    stageExp:abyssStageExpBudget(depth),
    nextRecommendedLevel:abyssRecommendedLevel(depth+1),
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.table(simulateStory());
  console.table(simulateAbyss());
}
