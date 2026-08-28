import '../js/patches/combat2ElementAffixes.js';
import { CP3_DEEP_SURVEYS, buildDeepSurveyStage } from '../js/data/postCp3DeepSurvey.js';
import { steerRealmAffix } from '../js/patches/loot3RealmTargetFarm.js';
import { applyItemPowerAffixQuality } from '../js/data/equipment3AffixQuality.js';
import { OPTION_RARITY, isOption4 } from '../js/data/options4.js';
import { optionMaterialXp } from '../js/data/options4Fusion.js';
import { shouldAutoLockEquipment } from '../js/data/equipment3SmartLoot.js';

const BASE_OPTIONS = Object.freeze(['atk_pct', 'def_pct', 'hp_pct']);
const SAMPLE_ITEM = Object.freeze({ rarity: 'mythic', slot: 'weapon', weaponType: 'sword' });

function blankInstance() {
  return {
    itemId: 'wp_sword_l',
    itemPower: 10000,
    affixTier: 7,
    affixes: BASE_OPTIONS.map((id) => ({ id, familyId: id, rarity: 'rare', level: 1, xp: 0, roll: 1, greater: false })),
  };
}

export function simulateDeepSurveyAcceptance(def, trials = 10000) {
  const stage = buildDeepSurveyStage(def.realmId);
  const preferred = new Set(def.preferredAffixIds);
  const familyHits = Object.fromEntries(def.preferredAffixIds.map((id) => [id, 0]));
  let targetHits = 0;
  let feedableItems = 0;
  let ancientItems = 0;
  let fusionXp = 0;
  let option4Records = 0;
  let optionRecords = 0;
  let maxOptions = 0;

  for (let i = 0; i < trials; i += 1) {
    const inst = blankInstance();
    const id = `${def.realmId}#accept-${i}`;
    // Runtime equipment generation assigns canonical rarity/level/value first;
    // Loot3 regional steering then changes at most one identity and re-applies
    // the same quality bridge. Mirror that order here so this is an acceptance
    // test of the live path rather than a synthetic Affix-only shortcut.
    applyItemPowerAffixQuality(inst, stage.loot3Profile, id);
    const changed = steerRealmAffix(inst, stage.loot3Profile, id);
    inst.greaterAffixCount = inst.affixes.filter((option) => option.greater).length;
    maxOptions = Math.max(maxOptions, inst.affixes.length);

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
    id: def.id,
    name: def.name,
    trials,
    targetRate: targetHits / trials,
    feedableRate: feedableItems / trials,
    ancientItemRate: ancientItems / trials,
    option4Rate: optionRecords ? option4Records / optionRecords : 0,
    maxOptions,
    fusionXp,
    familyHits,
  };
}

export function runDeepSurveyAcceptance(trials = 10000) {
  return CP3_DEEP_SURVEYS.map((def) => simulateDeepSurveyAcceptance(def, trials));
}

function pct(value) { return `${(value * 100).toFixed(2)}%`; }

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  console.log('Deep Survey acceptance simulation');
  for (const result of runDeepSurveyAcceptance()) {
    console.log(`\n${result.name}`);
    console.log(`  target bias : ${pct(result.targetRate)}`);
    console.log(`  feedable    : ${pct(result.feedableRate)}`);
    console.log(`  Ancient item: ${pct(result.ancientItemRate)}`);
    console.log(`  Option 4.0  : ${pct(result.option4Rate)}`);
    console.log(`  max Options : ${result.maxOptions}`);
    console.log(`  Fusion XP   : ${result.fusionXp.toLocaleString()}`);
    console.log(`  family hits : ${Object.entries(result.familyHits).map(([id, n]) => `${id}=${n}`).join(', ')}`);
  }
}
