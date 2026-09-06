/* ============================================================
   C1 — curated job identity registry and legacy-save migration map.

   This file intentionally has no runtime side effects yet.  It establishes
   the only destinations C1 is allowed to expose, and makes every current
   job id resolve before the Phase 8 catalogue is retired from the UI.
   ============================================================ */
import { allJobs as legacyAllJobs } from './jobs.js';
import { ALL_FUSION_JOBS } from './jobFusion.js';

export const C1_JOB_IDENTITIES = Object.freeze([
  Object.freeze({ id:'vanguard', name:'先陣', loop:'連撃でPressureを上げ、強打で使い切る。', sources:['fighter'] }),
  Object.freeze({ id:'bastion', name:'城塞', loop:'防御・被弾を反撃の機会へ変える。', sources:['warrior','craftsman','farmer'] }),
  Object.freeze({ id:'elementalist', name:'元素術師', loop:'属性を切り替え、MP循環で詠唱を続ける。', sources:['mage','scholar'] }),
  Object.freeze({ id:'chaplain', name:'聖護官', loop:'回復と加護を使い分け、危機を立て直す。', sources:['priest'] }),
  Object.freeze({ id:'shadow', name:'影刃', loop:'弱体・状態異常を付け、条件成立時に処刑する。', sources:['thief','ninja'] }),
  Object.freeze({ id:'ranger', name:'追跡者', loop:'標的をMarkし、追撃で狩り切る。', sources:['hunter'] }),
  Object.freeze({ id:'maestro', name:'楽匠', loop:'歌と舞でTempoを作り、行動順と支援を操作する。', sources:['bard','dancer'] }),
  Object.freeze({ id:'alchemist', name:'錬成士', loop:'試薬を付与し、反応・起爆で回収する。', sources:['alchemist'] }),
  Object.freeze({ id:'quartermaster', name:'補給官', loop:'資金・物資を戦闘内の供給判断に変える。', sources:['merchant'] }),
  Object.freeze({ id:'oracle', name:'星見', loop:'予兆を読み、危険を受け入れて結果を反転する。', sources:['fortune'] }),
]);

export const C1_JOB_BY_ID = new Map(C1_JOB_IDENTITIES.map((job) => [job.id, job]));

const BASIC_TARGET = Object.freeze({
  warrior:'bastion', fighter:'vanguard', mage:'elementalist', priest:'chaplain',
  thief:'shadow', merchant:'quartermaster', hunter:'ranger', ninja:'shadow',
  bard:'maestro', dancer:'maestro', alchemist:'alchemist', scholar:'elementalist',
  farmer:'bastion', craftsman:'bastion', fortune:'oracle',
});

// Priority is deliberate: a fusion's first surviving tactical loop wins.
// This is a migration destination, not a claim that the retired kit is equal
// to the destination kit; progress is converted to C1 migration credit later.
const TARGET_PRIORITY = Object.freeze([
  'alchemist', 'ranger', 'shadow', 'maestro', 'chaplain', 'elementalist',
  'vanguard', 'bastion', 'quartermaster', 'oracle',
]);

function targetForParents(parents) {
  const candidates = new Set(parents.map((id) => BASIC_TARGET[id]));
  return TARGET_PRIORITY.find((id) => candidates.has(id)) || null;
}

const SPECIAL_TARGET = Object.freeze({
  greatsage:'elementalist', swordsaint:'vanguard', fistemperor:'vanguard', pope:'chaplain',
  thiefking:'shadow', divaqueen:'maestro', grandalchemist:'alchemist', merchantking:'quartermaster',
  spiritking:'ranger', oracle:'oracle', hero:'vanguard',
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
