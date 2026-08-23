/* ============================================================
   Job Progression — EXP reward split
   ------------------------------------------------------------
   Character Lv is the long-term growth axis and receives the full EXP reward.
   Job Lv is deliberately slower: it receives only a fraction of the same reward.
   Job level requirements keep the existing short-form curve in state.js.
   ============================================================ */

export const JOB_EXP_REWARD_SHARE = 0.10;

export function splitProgressionExp(baseReward, commonExpMult = 1, characterOnlyMult = 1) {
  const base = Math.max(0, Number(baseReward) || 0);
  const common = Math.max(0, Number(commonExpMult) || 0);
  const characterMult = Math.max(0, Number(characterOnlyMult) || 0);
  return {
    character: Math.max(0, Math.round(base * common * characterMult)),
    job: Math.max(0, Math.round(base * JOB_EXP_REWARD_SHARE * common)),
  };
}
