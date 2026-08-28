/* ============================================================
   Post-CP3 Vertical Extension V4 — Convergence Apex
   ------------------------------------------------------------
   One existing-system Secret Realm encounter that synthesizes the three Deep
   Survey lessons. No new currency, save root, gear tier or combat engine.
   ============================================================ */
import { ENEMY_TYPES } from './enemies.js';
import { buildDeepSurveyStage, CP3_DEEP_SURVEYS } from './postCp3DeepSurvey.js';
import { encodeDeepSurveyConditionStageId, surveyConditionsForRegion } from './postCp3SurveyConditions.js';

export const CONVERGENCE_APEX_ID = 'secret-cp3-convergence-apex';
export const CONVERGENCE_APEX_SITE_ID = 'cp3_convergence_apex';

export function convergenceApexUnlockStatus(isCleared = () => false) {
  const baseline = CP3_DEEP_SURVEYS.map((def) => ({ id: def.id, cleared: !!isCleared(def.realmId) }));
  const conditioned = CP3_DEEP_SURVEYS.map((def) => {
    const any = surveyConditionsForRegion(def.id).some((condition) => isCleared(encodeDeepSurveyConditionStageId(def.realmId, [condition.id])));
    return { id: def.id, cleared: any };
  });
  return {
    baseline,
    conditioned,
    baselineCleared: baseline.filter((x) => x.cleared).length,
    conditionedRegions: conditioned.filter((x) => x.cleared).length,
    unlocked: baseline.every((x) => x.cleared) && conditioned.every((x) => x.cleared),
  };
}

export function convergenceApexExplorationSite() {
  return Object.freeze({
    id: CONVERGENCE_APEX_SITE_ID,
    hiddenName: '？？？',
    discoveredName: '三つの返送層が一点へ収束する観測裂け目',
    realmName: '収束観測・CONVERGENCE APEX',
    discoverDepth: 0,
    clueDepth: 0,
    fragmentSources: [],
    fragmentsRequired: 0,
    inspectText: Object.freeze([
      '灰・雷・根脈で別々に返されていた観測が、三つの深層を越えた後だけ同じ一点へ重なる。',
      '記録媒体は異なるのに、消された区間の輪郭だけが一致している。観測そのものではなく、返し方を選んだ何かがあるらしい。',
    ]),
    unlockedText: '三つの深層観測が同期し、収束観測への進路が開いた。',
    postCp3ConvergenceApex: true,
    realm: Object.freeze({
      id: CONVERGENCE_APEX_ID,
      recLevel: 99999,
      itemPowerTarget: 10000,
      rule: '耐久 → 速度 → 資源管理 → 三要素の収束。各圧力は順番に読み替わる。',
      rewardHint: '既存Gear最高密度のMIXED CHASE / CP3既存装備の再獲得 / 新通貨なし',
    }),
  });
}

function cloneBoss(source, id, name, mult = {}) {
  ENEMY_TYPES[id] = {
    ...source,
    name,
    boss: true,
    hp: Math.max(1, Math.round((source.hp || 1) * (mult.hp || 1))),
    atk: Math.max(1, Math.round((source.atk || 1) * (mult.atk || 1))),
    def: Math.max(0, Math.round((source.def || 0) * (mult.def || 1))),
    speed: Math.max(1, Math.round((source.speed || 80) * (mult.speed || 1))),
    xp: 0,
    gold: 0,
    convergenceApexPhase: mult.phase || null,
  };
}

function ensureApexEnemies() {
  const ash = buildDeepSurveyStage('secret-cp3-deep-ash');
  const ninth = buildDeepSurveyStage('secret-cp3-deep-ninth');
  const root = buildDeepSurveyStage('secret-cp3-deep-root');
  const ashBase = ENEMY_TYPES[ash.waves.at(-1).type];
  const ninthBase = ENEMY_TYPES[ninth.waves.at(-1).type];
  const rootBase = ENEMY_TYPES[root.waves.at(-1).type];
  if (!ashBase || !ninthBase || !rootBase) return false;

  cloneBoss(ashBase, 'cp3_apex_ash', '収束相・返灰耐圧', { hp: 0.72, atk: 0.95, def: 1.04, speed: 0.92, phase: 'ash' });
  cloneBoss(ninthBase, 'cp3_apex_ninth', '収束相・第九再照準', { hp: 0.62, atk: 1.02, def: 0.92, speed: 1.12, phase: 'ninth' });
  cloneBoss(rootBase, 'cp3_apex_root', '収束相・異記憶再演', { hp: 0.68, atk: 0.98, def: 1.0, speed: 1.0, phase: 'root' });
  cloneBoss(rootBase, 'cp3_apex_final', '収束観測核・CONVERGENCE', { hp: 0.88, atk: 1.04, def: 1.06, speed: 1.04, phase: 'convergence' });
  return true;
}

export function buildConvergenceApexStage() {
  if (!ensureApexEnemies()) return null;
  // Use the Root survey as the high-cap reward/drop foundation, then replace the
  // combat sequence with four authored boss phases. Each phase has reduced HP so
  // the complete encounter is a synthesis fight rather than four full Deep Surveys.
  const base = buildDeepSurveyStage('secret-cp3-deep-root');
  return {
    ...base,
    id: CONVERGENCE_APEX_ID,
    name: '収束観測・CONVERGENCE APEX',
    secretRealm: true,
    secretRealmId: CONVERGENCE_APEX_SITE_ID,
    postCp3DeepSurvey: false,
    postCp3ConvergenceApex: true,
    deepSurveyId: null,
    deepSurveyConditionIds: [],
    deepSurveyConditions: [],
    deepSurveyConditionEffects: null,
    convergenceApex: true,
    recLevel: 99999,
    itemPowerTarget: 10000,
    boss: true,
    waves: [
      { type: 'cp3_apex_ash', count: 1, interval: 0, convergencePhase: 'ash', noFreshGrace: false },
      { type: 'cp3_apex_ninth', count: 1, interval: 0, convergencePhase: 'ninth', noFreshGrace: true },
      { type: 'cp3_apex_root', count: 1, interval: 0, convergencePhase: 'root', noFreshGrace: true },
      { type: 'cp3_apex_final', count: 1, interval: 0, convergencePhase: 'convergence', noFreshGrace: true },
    ],
    modifiers: [
      { id: 'cp3_apex_cycle', name: '収束位相', desc: '耐久→速度→資源管理→収束。圧力は順に切り替わり、最大条件を同時には積まない。' },
    ],
    convergenceApexPhases: Object.freeze([
      Object.freeze({ id: 'ash', name: 'Phase I — Ash / endurance', hint: '回復圧と重い一撃。ガード・軽減・吸収が有効。' }),
      Object.freeze({ id: 'ninth', name: 'Phase II — Ninth / tempo', hint: '高速再照準。短期決着・先手・速度が有効。' }),
      Object.freeze({ id: 'root', name: 'Phase III — Root / rotation', hint: 'MP消費と行動反復圧。技・呪文・通常攻撃を回す。' }),
      Object.freeze({ id: 'convergence', name: 'Final — Convergence', hint: '三つの圧力を順番に再演する。読み切るか、十分な火力と耐久で押し切る。' }),
    ]),
    convergenceRewardHint: 'IP10,000 / max3 Option / Greater・Legendary・Named候補の既存MIXED CHASE。Apex専用通貨・Tierなし。',
    loot3Profile: {
      ...base.loot3Profile,
      label: '収束観測：全地域MIXED CHASE',
      preferredAffixIds: [...new Set(CP3_DEEP_SURVEYS.flatMap((d) => d.preferredAffixIds))],
      targetAffixChance: 0.36,
      legendaryChanceAdd: 0.04,
    },
    dropRegionTags: [...new Set(CP3_DEEP_SURVEYS.flatMap((d) => d.tags))],
    dropMult: (base.dropMult || 1) * 1.08,
    rewards: { gold: Math.round(base.rewards.gold * 1.12), exp: base.rewards.exp },
    firstClear: { itemId: 'uq_cp3_boundary_echo' },
    dropTable: [
      ...base.dropTable,
      { itemId: 'uq_cp3_reply_guard', weight: 0.45 },
      { itemId: 'uq_cp3_return_coil', weight: 0.45 },
      { itemId: 'uq_cp3_living_archive', weight: 0.45 },
      { itemId: 'uq_cp3_boundary_echo', weight: 0.3 },
    ],
  };
}
