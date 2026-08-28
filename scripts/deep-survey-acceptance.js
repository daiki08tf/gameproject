import '../js/patches/combat2ElementAffixes.js';
import { CP3_DEEP_SURVEYS, buildDeepSurveyStage } from '../js/data/postCp3DeepSurvey.js';
import { buildConvergenceApexStage } from '../js/data/postCp3ConvergenceApex.js';
import { encodeDeepSurveyConditionStageId, surveyConditionsForRegion } from '../js/data/postCp3SurveyConditions.js';
import { steerRealmAffix } from '../js/patches/loot3RealmTargetFarm.js';
import { applyItemPowerAffixQuality } from '../js/data/equipment3AffixQuality.js';
import { applyGreaterAffixes, GREATER_AFFIX_MAX_PER_ITEM } from '../js/data/equipment3Greater.js';
import { OPTION_RARITY, isOption4 } from '../js/data/options4.js';
import { optionMaterialXp } from '../js/data/options4Fusion.js';
import { shouldAutoLockEquipment } from '../js/data/equipment3SmartLoot.js';

// Neutral baseline: none of these families is preferred by any Deep Survey
// region or the Convergence Apex. Every preferred-family hit therefore comes
// from the live Loot3 target-steering path.
const BASE_OPTIONS = Object.freeze(['atk_pct', 'evasion_pct', 'armorpen_pct']);
const SAMPLE_ITEM = Object.freeze({ rarity: 'mythic', slot: 'weapon', weaponType: 'sword' });

function blankInstance() {
  return {
    itemId: 'wp_sword_l',
    itemPower: 10000,
    affixTier: 7,
    affixes: BASE_OPTIONS.map((id) => ({ id, familyId: id, rarity: 'rare', level: 1, xp: 0, roll: 1, greater: false })),
  };
}

export function simulateStageAcceptance(stage, {
  id = stage.id,
  name = stage.name,
  preferredAffixIds = stage.loot3Profile?.preferredAffixIds || [],
  trials = 10000,
} = {}) {
  const preferred = new Set(preferredAffixIds);
  const familyHits = Object.fromEntries(preferredAffixIds.map((optionId) => [optionId, 0]));
  let targetHits = 0;
  let feedableItems = 0;
  let ancientItems = 0;
  let greaterItems = 0;
  let greaterOptions = 0;
  let fusionXp = 0;
  let option4Records = 0;
  let optionRecords = 0;
  let maxOptions = 0;
  let maxGreater = 0;

  for (let i = 0; i < trials; i += 1) {
    const inst = blankInstance();
    const instanceId = `${id}#accept-${i}`;

    // Mirror the live drop pipeline closely: canonical IP quality first,
    // Greater evaluation second, realm steering last. steerRealmAffix reuses
    // the same quality bridge after identity replacement and preserves Greater.
    applyItemPowerAffixQuality(inst, stage.loot3Profile, instanceId);
    const greater = applyGreaterAffixes(inst.affixes, inst.itemPower, { boss: true }, instanceId);
    inst.affixes = greater.affixes;
    inst.greaterAffixCount = greater.greaterCount;
    const changed = steerRealmAffix(inst, stage.loot3Profile, instanceId);
    inst.greaterAffixCount = inst.affixes.filter((option) => option.greater).length;

    maxOptions = Math.max(maxOptions, inst.affixes.length);
    maxGreater = Math.max(maxGreater, inst.greaterAffixCount);
    if (inst.greaterAffixCount > 0) greaterItems += 1;
    greaterOptions += inst.greaterAffixCount;
    if (changed) targetHits += 1;
    if (!shouldAutoLockEquipment(SAMPLE_ITEM, inst)) feedableItems += 1;
    if (inst.affixes.some((option) => OPTION_RARITY.indexOf(option.rarity) >= OPTION_RARITY.indexOf('ancient'))) ancientItems += 1;

    for (const option of inst.affixes) {
      optionRecords += 1;
      if (isOption4(option)) option4Records += 1;
      if (!preferred.has(option.id)) continue;
      familyHits[option.id] += 1;
      fusionXp += optionMaterialXp({ id: option.id, familyId: option.familyId, rarity: 'mythic', level: 80, xp: 0 }, option);
    }
  }

  return {
    id,
    name,
    trials,
    configuredTargetRate: Number(stage.loot3Profile?.targetAffixChance) || 0,
    legendaryChanceAdd: Number(stage.loot3Profile?.legendaryChanceAdd) || 0,
    targetRate: targetHits / trials,
    feedableRate: feedableItems / trials,
    ancientItemRate: ancientItems / trials,
    greaterItemRate: greaterItems / trials,
    greaterOptionRate: optionRecords ? greaterOptions / optionRecords : 0,
    option4Rate: optionRecords ? option4Records / optionRecords : 0,
    maxOptions,
    maxGreater,
    greaterMaxContract: GREATER_AFFIX_MAX_PER_ITEM,
    fusionXp,
    familyHits,
  };
}

export function simulateDeepSurveyAcceptance(def, trials = 10000) {
  return simulateStageAcceptance(buildDeepSurveyStage(def.realmId), {
    id: def.id,
    name: def.realmName,
    preferredAffixIds: def.preferredAffixIds,
    trials,
  });
}

export function buildVerticalAcceptanceScenarios(def) {
  const conditions = surveyConditionsForRegion(def.id);
  const singleIds = conditions.slice(0, 1).map((condition) => condition.id);
  const doubleIds = conditions.slice(0, 2).map((condition) => condition.id);
  return [
    { kind: 'baseline', expectedTargetRate: 0.34, stage: buildDeepSurveyStage(def.realmId) },
    { kind: 'single', expectedTargetRate: 0.38, stage: buildDeepSurveyStage(encodeDeepSurveyConditionStageId(def.realmId, singleIds)) },
    { kind: 'double', expectedTargetRate: 0.42, stage: buildDeepSurveyStage(encodeDeepSurveyConditionStageId(def.realmId, doubleIds)) },
  ];
}

export function runVerticalExtensionAcceptance(trials = 10000) {
  const regions = CP3_DEEP_SURVEYS.map((def) => ({
    id: def.id,
    name: def.realmName,
    scenarios: buildVerticalAcceptanceScenarios(def).map((scenario) => ({
      kind: scenario.kind,
      expectedTargetRate: scenario.expectedTargetRate,
      result: simulateStageAcceptance(scenario.stage, {
        id: `${def.id}:${scenario.kind}`,
        name: `${def.realmName} / ${scenario.kind}`,
        preferredAffixIds: def.preferredAffixIds,
        trials,
      }),
    })),
  }));

  const apexStage = buildConvergenceApexStage();
  const apex = simulateStageAcceptance(apexStage, {
    id: 'convergence-apex',
    name: apexStage.name,
    preferredAffixIds: apexStage.loot3Profile.preferredAffixIds,
    trials,
  });

  return { regions, apex };
}

export function runDeepSurveyAcceptance(trials = 10000) {
  return CP3_DEEP_SURVEYS.map((def) => simulateDeepSurveyAcceptance(def, trials));
}

function pct(value) { return `${(value * 100).toFixed(2)}%`; }
function printResult(result) {
  console.log(`  configured  : ${pct(result.configuredTargetRate)}`);
  console.log(`  target bias : ${pct(result.targetRate)}`);
  console.log(`  feedable    : ${pct(result.feedableRate)}`);
  console.log(`  Ancient item: ${pct(result.ancientItemRate)}`);
  console.log(`  Greater item: ${pct(result.greaterItemRate)}`);
  console.log(`  Greater opt : ${pct(result.greaterOptionRate)}`);
  console.log(`  Option 4.0  : ${pct(result.option4Rate)}`);
  console.log(`  max Options : ${result.maxOptions}`);
  console.log(`  max Greater : ${result.maxGreater}/${result.greaterMaxContract}`);
  console.log(`  Legendary + : ${pct(result.legendaryChanceAdd)}`);
  console.log(`  Fusion XP   : ${result.fusionXp.toLocaleString()}`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  console.log('Post-CP3 vertical-extension acceptance simulation');
  const report = runVerticalExtensionAcceptance();
  for (const region of report.regions) {
    console.log(`\n${region.name}`);
    for (const scenario of region.scenarios) {
      console.log(`\n [${scenario.kind}] expected ${pct(scenario.expectedTargetRate)}`);
      printResult(scenario.result);
    }
  }
  console.log(`\n${report.apex.name}`);
  printResult(report.apex);
}
