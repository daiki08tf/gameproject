/* ============================================================
   C1 — curated job identity registry and legacy-save migration map.

   This file intentionally has no runtime side effects yet.  It establishes
   the only destinations C1 is allowed to expose, and makes every current
   job id resolve before the Phase 8 catalogue is retired from the UI.
   ============================================================ */
import { allJobs as legacyAllJobs, computeStats as legacyComputeStats } from './jobs.js';
import { ALL_FUSION_JOBS } from './jobFusion.js';

export const C1_JOB_IDENTITIES = Object.freeze([
  Object.freeze({ id:'c1_vanguard', name:'先陣', loop:'連撃でPressureを上げ、強打で使い切る。', sources:['fighter','battlemaster'] }),
  Object.freeze({ id:'c1_bastion', name:'城塞', loop:'防御・被弾を反撃の機会へ変える。', sources:['craftsman','warrior','farmer'] }),
  Object.freeze({ id:'c1_elementalist', name:'元素術師', loop:'属性を切り替え、MP循環で詠唱を続ける。', sources:['mage','archmage','scholar'] }),
  Object.freeze({ id:'c1_chaplain', name:'聖護官', loop:'回復と加護を使い分け、危機を立て直す。', sources:['priest','paladin'] }),
  Object.freeze({ id:'c1_shadow', name:'影刃', loop:'弱体・状態異常を付け、条件成立時に処刑する。', sources:['ninja','phantomthief','thief'] }),
  Object.freeze({ id:'c1_ranger', name:'追跡者', loop:'標的をMarkし、追撃で狩り切る。', sources:['hunter','huntking'] }),
  Object.freeze({ id:'c1_maestro', name:'楽匠', loop:'歌と舞でTempoを作り、行動順と支援を操作する。', sources:['bard','primadiva','dancer'] }),
  Object.freeze({ id:'c1_alchemist', name:'錬成士', loop:'試薬を付与し、反応・起爆で回収する。', sources:['alchemist','arcanist'] }),
  Object.freeze({ id:'c1_quartermaster', name:'補給官', loop:'資金・物資を戦闘内の供給判断に変える。', sources:['merchant','guildmaster'] }),
  Object.freeze({ id:'c1_oracle', name:'星見', loop:'予兆を読み、危険を受け入れて結果を反転する。', sources:['fortune','astromancer'] }),
]);

export const C1_JOB_BY_ID = new Map(C1_JOB_IDENTITIES.map((job) => [job.id, job]));

const BASIC_TARGET = Object.freeze({
  warrior:'c1_bastion', fighter:'c1_vanguard', mage:'c1_elementalist', priest:'c1_chaplain',
  thief:'c1_shadow', merchant:'c1_quartermaster', hunter:'c1_ranger', ninja:'c1_shadow',
  bard:'c1_maestro', dancer:'c1_maestro', alchemist:'c1_alchemist', scholar:'c1_elementalist',
  farmer:'c1_bastion', craftsman:'c1_bastion', fortune:'c1_oracle',
});

// Priority is deliberate: a fusion's first surviving tactical loop wins.
// This is a migration destination, not a claim that the retired kit is equal
// to the destination kit; progress is converted to C1 migration credit later.
const TARGET_PRIORITY = Object.freeze([
  'c1_alchemist', 'c1_ranger', 'c1_shadow', 'c1_maestro', 'c1_chaplain', 'c1_elementalist',
  'c1_vanguard', 'c1_bastion', 'c1_quartermaster', 'c1_oracle',
]);

function targetForParents(parents) {
  const candidates = new Set(parents.map((id) => BASIC_TARGET[id]));
  return TARGET_PRIORITY.find((id) => candidates.has(id)) || null;
}

const SPECIAL_TARGET = Object.freeze({
  greatsage:'c1_elementalist', swordsaint:'c1_vanguard', fistemperor:'c1_vanguard', pope:'c1_chaplain',
  thiefking:'c1_shadow', divaqueen:'c1_maestro', grandalchemist:'c1_alchemist', merchantking:'c1_quartermaster',
  spiritking:'c1_ranger', oracle:'c1_oracle', hero:'c1_vanguard',
});

const legacy = legacyAllJobs();
const legacyById = new Map(legacy.map((job) => [job.id, job]));
const persistedLegacyIds = [...new Set([...legacy.map((job) => job.id), ...ALL_FUSION_JOBS.map((job) => job.id)])];
const migrationEntries = [
  ...Object.entries(BASIC_TARGET),
  ...ALL_FUSION_JOBS.map((job) => [job.id, targetForParents(job.parents)]),
  ...Object.entries(SPECIAL_TARGET),
];

export const C1_LEGACY_JOB_MIGRATION = Object.freeze(Object.fromEntries(migrationEntries));

export function c1MigrationTargetForLegacyJob(jobId) {
  return C1_LEGACY_JOB_MIGRATION[jobId] || null;
}

export function c1MigrationAudit() {
  const missing = persistedLegacyIds.filter((id) => !c1MigrationTargetForLegacyJob(id));
  const invalidTargets = Object.entries(C1_LEGACY_JOB_MIGRATION)
    .filter(([, target]) => !C1_JOB_BY_ID.has(target)).map(([id]) => id);
  return Object.freeze({
    ok: missing.length === 0 && invalidTargets.length === 0,
    legacyJobCount: persistedLegacyIds.length,
    fusionJobCount: ALL_FUSION_JOBS.length,
    mappedJobCount: Object.keys(C1_LEGACY_JOB_MIGRATION).length,
    missing: Object.freeze(missing),
    invalidTargets: Object.freeze(invalidTargets),
  });
}

export function legacyJobRecord(jobId) {
  return legacyById.get(jobId) || null;
}

export const C1_RUNTIME_JOBS = Object.freeze(C1_JOB_IDENTITIES.map((identity) => {
  const kits = identity.sources.map((id) => legacyById.get(id)).filter(Boolean);
  const primary = kits[0];
  return Object.freeze({
    id: identity.id, name: identity.name, desc: identity.loop, tier:'basic', requires:[],
    weapon: primary.weapon, profile:{ ...primary.profile }, passive: primary.passive,
    skills: kits.flatMap((job) => job.skills || []), spells: kits.flatMap((job) => job.spells || []),
    c1:true, c1Identity:identity,
    c1Combat: identity.id === 'c1_vanguard' ? Object.freeze({
      kind:'pressure', maxStacks:3, damagePerStack:0.12,
      gainSkillIds:Object.freeze(['fighter_flurry','battlemaster_rapid_break']),
      spendSkillIds:Object.freeze(['fighter_straight_punch','battlemaster_armor_breaker','battlemaster_peerless']),
    }) : identity.id === 'c1_elementalist' ? Object.freeze({ kind:'elementCycle', mpRefundPct:0.25 })
      : identity.id === 'c1_shadow' ? Object.freeze({
        kind:'execution', bonusPower:3,
        setupSkillIds:Object.freeze(['thief_dark_slash','thief_poison_blade','ninja_poison_star','ninja_pin']),
        executionSkillIds:Object.freeze(['phantomthief_backstab']),
      }) : identity.id === 'c1_maestro' ? Object.freeze({
        kind:'chorus', bonusPower:2,
        finaleSkillIds:Object.freeze(['dancer_blade_dance','primadiva_sword_aria']),
      }) : identity.id === 'c1_chaplain' ? Object.freeze({
        kind:'sanctuary', regenAdd:0.02, regenTurns:2,
        healSpellIds:Object.freeze(['priest_heal','priest_full_heal']),
      }) : identity.id === 'c1_quartermaster' ? Object.freeze({ kind:'supply', mpRefundPct:0.25 })
      : identity.id === 'c1_oracle' ? Object.freeze({
        kind:'omen', critBonus:15,
        attackSpellIds:Object.freeze(['astromancer_star_bullet']),
      }) : null,
  });
}));
const C1_RUNTIME_BY_ID = new Map(C1_RUNTIME_JOBS.map((job) => [job.id, job]));

export function getC1RuntimeJob(jobId) { return C1_RUNTIME_BY_ID.get(jobId) || null; }
export function computeC1JobStats(jobId, level) {
  const job = getC1RuntimeJob(jobId);
  return job ? legacyComputeStats(job.c1Identity.sources[0], level) : null;
}

function betterProgress(a, b) {
  if (!a) return b;
  if ((b.level || 1) !== (a.level || 1)) return (b.level || 1) > (a.level || 1) ? b : a;
  return (b.exp || 0) > (a.exp || 0) ? b : a;
}

export function migrateC1JobSave(data = {}) {
  const jobs = { ...(data.jobs || {}) };
  const mastered = Array.isArray(data.mastered) ? [...data.mastered] : [];
  const bestByTarget = new Map();
  for (const [sourceId, progress] of Object.entries(jobs)) {
    const target = c1MigrationTargetForLegacyJob(sourceId);
    if (target) bestByTarget.set(target, betterProgress(bestByTarget.get(target), progress || {}));
  }
  for (const [target, progress] of bestByTarget) jobs[target] = { level:Math.max(1, progress.level || 1), exp:Math.max(0, progress.exp || 0) };
  const migratedMastered = new Set(mastered);
  for (const sourceId of mastered) {
    const target = c1MigrationTargetForLegacyJob(sourceId);
    if (target) migratedMastered.add(target);
  }
  const selected = { ...(data.job3Specializations || {}) };
  for (const [sourceId, routeId] of Object.entries(data.job3Specializations || {})) {
    const target = c1MigrationTargetForLegacyJob(sourceId);
    if (target && selected[target] == null) selected[target] = routeId;
  }
  const slots = [...new Set((data.job3LegacySlots || []).map((id) => c1MigrationTargetForLegacyJob(id) || id))];
  return {
    ...data, jobs, mastered:[...migratedMastered], job3Specializations:selected, job3LegacySlots:slots,
    currentJobId:c1MigrationTargetForLegacyJob(data.currentJobId) || data.currentJobId,
  };
}
