/* ============================================================
   Post-CP3 Vertical Extension V1–V3 — Survey Conditions
   ------------------------------------------------------------
   Authored optional replay clauses for the existing three Deep Surveys.
   No currency, save root, timed cadence, rarity tier, or parallel mode.
   ============================================================ */

const C = (id, regionId, name, desc, effect, reward = {}) => Object.freeze({
  id, regionId, name, desc,
  effect: Object.freeze({ ...effect }),
  reward: Object.freeze({
    targetAffixChanceAdd: Math.max(0, Math.min(0.04, Number(reward.targetAffixChanceAdd) || 0)),
    legendaryChanceAdd: Math.max(0, Math.min(0.02, Number(reward.legendaryChanceAdd) || 0)),
  }),
});

export const DEEP_SURVEY_CONDITIONS = Object.freeze([
  C('ash_pressure', 'cp3_deep_ash', '灰圧増幅', '敵の耐久圧が増す。長期戦を受け切る基礎耐久と継戦力を問う。', { enemyHpMult: 1.18 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),
  C('ash_dry_wound', 'cp3_deep_ash', '乾いた傷口', '回復効率がさらに低下する。ただし回復そのものは封じない。', { healMult: 0.72 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),
  C('ash_echo_hit', 'cp3_deep_ash', '反響打撃', '攻め続けるほど受ける圧が増す。ぼうぎょ・防御タイミングで反響を断ち切れる。', { directPressurePerAction: 0.06, directPressureMaxStacks: 3 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),

  C('ninth_retarget', 'cp3_deep_ninth', '再照準短縮', '敵の行動テンポが上がる。先手・速度・短期決着の価値が増す。', { enemySpeedMult: 1.18 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),
  C('ninth_elite_chain', 'cp3_deep_ninth', '精鋭連鎖', '通常区画の精鋭圧が増す。危険対象を素早く処理する判断を問う。', { waveCountMult: 1.18, elitePressure: 1 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),
  C('ninth_target_lock', 'cp3_deep_ninth', '照準固定', '戦闘が長引くほど照準が固定され、被ダメージ圧が緩やかに増す。', { longFightPressurePerRound: 0.012, longFightPressureMax: 0.18 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),

  C('root_saturation', 'cp3_deep_root', '記録飽和', '同じ行動種の反復効率が少し落ちる。別行動を挟めば即座に飽和が解ける。', { repeatedActionPenalty: 0.08, repeatedActionPenaltyMax: 0.16 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),
  C('root_depletion', 'cp3_deep_root', '根脈枯渇', 'とくぎ・じゅもんのMP消費が増える。資源管理と回復Optionの価値が増す。', { mpCostMult: 1.20 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),
  C('root_replay', 'cp3_deep_root', '生体再演', 'Bossの固有技周期が短くなる。予兆対応と行動ローテーションを問う。', { bossTechniqueIntervalMult: 0.78 }, { targetAffixChanceAdd: 0.04, legendaryChanceAdd: 0.01 }),
]);

const BY_ID = new Map(DEEP_SURVEY_CONDITIONS.map((c) => [c.id, c]));
const activeByRealm = new Map();
const SUFFIX = '~ds:';

export function surveyCondition(id) { return BY_ID.get(String(id || '')) || null; }
export function surveyConditionsForRegion(regionId) { return DEEP_SURVEY_CONDITIONS.filter((c) => c.regionId === regionId); }

export function parseDeepSurveyConditionStageId(stageId) {
  const raw = String(stageId || '');
  const at = raw.indexOf(SUFFIX);
  if (at < 0) return { baseRealmId: raw, conditionIds: [] };
  const baseRealmId = raw.slice(0, at);
  const conditionIds = raw.slice(at + SUFFIX.length).split('+').filter((id) => BY_ID.has(id));
  return { baseRealmId, conditionIds: [...new Set(conditionIds)] };
}

export function encodeDeepSurveyConditionStageId(baseRealmId, conditionIds = []) {
  const clean = [...new Set(conditionIds.map(String).filter((id) => BY_ID.has(id)))];
  return clean.length ? `${baseRealmId}${SUFFIX}${clean.join('+')}` : String(baseRealmId || '');
}

export function singleConditionStageIds(regionId, baseRealmId) {
  return surveyConditionsForRegion(regionId).map((c) => encodeDeepSurveyConditionStageId(baseRealmId, [c.id]));
}
export function surveyConditionMastery(regionId, baseRealmId, isCleared = () => false) {
  const ids = singleConditionStageIds(regionId, baseRealmId);
  const cleared = ids.filter((id) => !!isCleared(id));
  return { regionId, total: ids.length, cleared: cleared.length, complete: ids.length === 3 && cleared.length === 3, stageIds: ids, clearedStageIds: cleared };
}
export function twoConditionUnlocked(regionId, baseRealmId, isCleared = () => false) {
  return surveyConditionMastery(regionId, baseRealmId, isCleared).complete;
}

// Runtime-only selection. The selected IDs are encoded immediately before
// TextBattle constructs BattleEngine; clear history is therefore ordinary stage
// clear metadata, not a new progression/save root.
export function setActiveDeepSurveyConditions(baseRealmId, conditionIds = [], maxConditions = 1) {
  const key = parseDeepSurveyConditionStageId(baseRealmId).baseRealmId;
  const max = Math.max(0, Math.min(2, Math.floor(Number(maxConditions) || 0)));
  const selected = [...new Set(conditionIds.map(String))].map(surveyCondition).filter(Boolean).slice(0, max);
  if (!selected.length) { activeByRealm.delete(key); return []; }
  activeByRealm.set(key, selected.map((c) => c.id));
  return selected;
}
export function setActiveDeepSurveyCondition(baseRealmId, conditionId = null) {
  return setActiveDeepSurveyConditions(baseRealmId, conditionId ? [conditionId] : [], 1)[0] || null;
}
export function activeDeepSurveyConditions(baseRealmId) {
  const key = parseDeepSurveyConditionStageId(baseRealmId).baseRealmId;
  return (activeByRealm.get(key) || []).map(surveyCondition).filter(Boolean);
}
export function activeDeepSurveyCondition(baseRealmId) { return activeDeepSurveyConditions(baseRealmId)[0] || null; }
export function clearActiveDeepSurveyCondition(baseRealmId) {
  const key = parseDeepSurveyConditionStageId(baseRealmId).baseRealmId;
  activeByRealm.delete(key);
}
export function stageIdForActiveDeepSurveyCondition(stageId) {
  const parsed = parseDeepSurveyConditionStageId(stageId);
  const active = activeDeepSurveyConditions(parsed.baseRealmId);
  return encodeDeepSurveyConditionStageId(parsed.baseRealmId, active.map((c) => c.id));
}

export function resolveDeepSurveyConditionIds(stageId) { return parseDeepSurveyConditionStageId(stageId); }

export function conditionRewardProfile(baseProfile = {}, conditionIds = []) {
  const conditions = conditionIds.map(surveyCondition).filter(Boolean).slice(0, 2);
  const targetAdd = conditions.reduce((sum, c) => sum + c.reward.targetAffixChanceAdd, 0);
  const legendaryAdd = conditions.reduce((sum, c) => sum + c.reward.legendaryChanceAdd, 0);
  const baseTarget = Number(baseProfile.targetAffixChance) || 0;
  const baseLegendary = Number(baseProfile.legendaryChanceAdd) || 0;
  const targetCap = conditions.length >= 2 ? 0.42 : conditions.length ? 0.38 : 0.34;
  return {
    ...baseProfile,
    targetAffixChance: Math.min(targetCap, baseTarget + targetAdd),
    legendaryChanceAdd: Math.min(baseLegendary + 0.04, baseLegendary + legendaryAdd),
  };
}
