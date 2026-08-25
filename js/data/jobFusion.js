/* ============================================================
   Phase 8 — Job Fusion / Skill Constellation 3.0

   This module is intentionally data-first. It introduces the common schema
   used by Fusion Jobs without changing the existing job registry yet.
   Existing 30 advanced-job IDs remain authoritative during migration.
   ============================================================ */

export const BASIC_JOB_ORDER = Object.freeze([
  'warrior', 'fighter', 'mage', 'priest', 'thief',
  'merchant', 'hunter', 'ninja', 'bard', 'dancer',
  'alchemist', 'scholar', 'farmer', 'craftsman', 'fortuneteller',
]);

const BASIC_JOB_INDEX = new Map(BASIC_JOB_ORDER.map((id, index) => [id, index]));

export const FUSION_SCHEMA_VERSION = 1;

export function canonicalParents(parentA, parentB) {
  if (parentA === parentB) throw new Error('Fusion Job requires two different parent jobs.');
  const ai = BASIC_JOB_INDEX.get(parentA);
  const bi = BASIC_JOB_INDEX.get(parentB);
  if (ai == null || bi == null) throw new Error(`Unknown basic job pair: ${parentA}, ${parentB}`);
  return ai < bi ? [parentA, parentB] : [parentB, parentA];
}

export function fusionPairKey(parentA, parentB) {
  return canonicalParents(parentA, parentB).join('+');
}

export function generatedFusionId(parentA, parentB) {
  const [a, b] = canonicalParents(parentA, parentB);
  return `fusion_${a}_${b}`;
}

/**
 * @typedef {Object} FusionJobDefinition
 * @property {number} schemaVersion
 * @property {string} id Stable save-data ID.
 * @property {string} name Display name; safe to rename independently of id.
 * @property {[string,string]} parents Canonically ordered basic-job IDs.
 * @property {'legacy'|'fusion'} source
 * @property {Object|null} fusionTrait Rule-changing identity shared across the build.
 * @property {Object|null} resourceInteraction How the two parent identities/resources interact.
 * @property {Object|null} constellation Skill Constellation definition or prototype reference.
 * @property {string[]} lootTags Desired Loot 3.0 affix/tag affinities.
 */

export function defineFusionJob({
  id,
  name,
  parents,
  source = 'fusion',
  fusionTrait = null,
  resourceInteraction = null,
  constellation = null,
  lootTags = [],
}) {
  if (!id || !name || !Array.isArray(parents) || parents.length !== 2) {
    throw new Error('Invalid Fusion Job definition.');
  }
  const canonical = canonicalParents(parents[0], parents[1]);
  return Object.freeze({
    schemaVersion: FUSION_SCHEMA_VERSION,
    id,
    name,
    parents: Object.freeze(canonical),
    source,
    fusionTrait,
    resourceInteraction,
    constellation,
    lootTags: Object.freeze([...lootTags]),
  });
}

// Representative prototypes only. These prove that very different pair types
// fit the same schema before the remaining 101 definitions are expanded.
export const FUSION_PROTOTYPES = Object.freeze([
  defineFusionJob({
    id: 'battlemaster',
    name: '羅刹',
    parents: ['warrior', 'fighter'],
    source: 'legacy',
    fusionTrait: {
      id: 'relentless_assault',
      summary: '連続して攻撃行動を取るほど攻勢が高まり、被弾で一部を反撃へ変換する。',
      tags: ['rage', 'combo', 'counter'],
    },
    resourceInteraction: {
      id: 'rage_combo_loop',
      inputs: ['rage', 'combo'],
      output: 'momentum',
      summary: 'RageとComboをMomentumへ束ね、攻撃継続か反撃へ使い分ける。',
    },
    constellation: { prototype: 'vanguard_dual_branch' },
    lootTags: ['physical', 'melee', 'rage', 'counter', 'combo'],
  }),
  defineFusionJob({
    id: 'spellblade',
    name: '魔法剣士',
    parents: ['warrior', 'mage'],
    source: 'legacy',
    fusionTrait: {
      id: 'arcane_edge',
      summary: '属性付与した武器攻撃が弱点命中時に追加Breakを与える。',
      tags: ['element', 'imbue', 'break'],
    },
    resourceInteraction: {
      id: 'guard_arcane_conversion',
      inputs: ['guard', 'arcane'],
      output: 'imbue_charge',
      summary: '防御と魔力をImbue Chargeへ変換し、次の武器攻撃を属性化する。',
    },
    constellation: { prototype: 'spellblade_dual_branch' },
    lootTags: ['sword', 'elemental', 'spellblade', 'break'],
  }),
  defineFusionJob({
    id: 'fusion_warrior_merchant',
    name: '傭兵団長',
    parents: ['warrior', 'merchant'],
    fusionTrait: {
      id: 'field_logistics',
      summary: '戦闘中のGold支出を補給・援護・前衛強化へ変換する。',
      tags: ['gold', 'supply', 'command'],
    },
    resourceInteraction: {
      id: 'war_chest',
      inputs: ['gold', 'guard'],
      output: 'supply',
      summary: 'GoldをSupplyとして確保し、防御・援護・追撃へ振り分ける。',
    },
    constellation: { prototype: 'commander_dual_branch' },
    lootTags: ['gold', 'defense', 'command', 'utility'],
  }),
  defineFusionJob({
    id: 'fusion_thief_scholar',
    name: '遺跡探究家',
    parents: ['thief', 'scholar'],
    fusionTrait: {
      id: 'forbidden_insight',
      summary: '解析済みの敵・罠・遺物ほどCrit、発見率、特殊報酬が伸びる。',
      tags: ['codex', 'analysis', 'discovery'],
    },
    resourceInteraction: {
      id: 'insight_exploit',
      inputs: ['analysis', 'opportunity'],
      output: 'insight',
      summary: '解析情報をInsightへ蓄積し、弱点攻撃か探索報酬へ消費する。',
    },
    constellation: { prototype: 'explorer_dual_branch' },
    lootTags: ['codex', 'rare', 'trap', 'crit', 'discovery'],
  }),
]);

export const FUSION_PROTOTYPE_BY_PAIR = new Map(
  FUSION_PROTOTYPES.map(job => [fusionPairKey(...job.parents), job]),
);

export function getFusionPrototype(parentA, parentB) {
  return FUSION_PROTOTYPE_BY_PAIR.get(fusionPairKey(parentA, parentB)) ?? null;
}

export function validateFusionDefinitions(definitions) {
  const ids = new Set();
  const pairs = new Set();
  const names = new Set();
  const errors = [];

  for (const job of definitions) {
    const pair = fusionPairKey(...job.parents);
    if (ids.has(job.id)) errors.push(`duplicate id: ${job.id}`);
    if (pairs.has(pair)) errors.push(`duplicate pair: ${pair}`);
    if (names.has(job.name)) errors.push(`duplicate name: ${job.name}`);
    ids.add(job.id);
    pairs.add(pair);
    names.add(job.name);
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ ids: ids.size, pairs: pairs.size, names: names.size }),
  });
}
