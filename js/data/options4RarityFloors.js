/* Gear Overhaul — Option 4.0 rarity floors.
   Applied once at runtime to the shared mutable Affix registry so both the
   legacy weapon generator and Equipment 3.0 gear generator obey the same rule. */
import { AFFIXES, affixRarityIndex } from './affixes.js';

export const OPTION_MIN_RARITY = Object.freeze({
  // Broad/universal power should not crowd Common loot.
  dmg_all: 'rare',
  dmg_boss: 'rare',
  dmg_elite: 'rare',
  boss_special_mitigation: 'rare',
  cdr_pct: 'rare',

  // Farming utility: EXP is rarer than Gold; Drop is a true chase Option.
  gold_pct: 'rare',
  exp_pct: 'epic',
  drop_pct: 'legendary',

  // Action-pattern changing procs begin at Rare.
  crit_extra_hit: 'rare',
  crit_atk_buff: 'rare',
  crit_spd_buff: 'rare',
  every_n_hits: 'rare',
  hit_low_dot: 'rare',
  hit_low_defdown: 'rare',
  guard_next_atk: 'rare',
  evade_crit_buff: 'rare',
  kill_atk_buff: 'rare',
  spell_mag_buff: 'rare',
  spell_mp_refund: 'rare',

  // Build Affixes are already authored as Legendary minimum in affixes.js;
  // repeat the policy here so the Option catalog is the canonical contract.
  build_bloodedge: 'legendary',
  build_manaecho: 'legendary',
  build_executioner: 'legendary',
  build_thousandblades: 'legendary',
  build_venomheart: 'legendary',
  build_ironvengeance: 'legendary',
  build_manacycle: 'legendary',
  build_predator: 'legendary',
  build_laststand: 'legendary',
  build_deathline: 'legendary',
  build_arcanebarrier: 'legendary',
  build_quickdraw: 'legendary',
});

export function optionMinimumRarity(familyOrAffixId) {
  return OPTION_MIN_RARITY[familyOrAffixId] || null;
}

export function applyOption4RarityFloors(registry = AFFIXES) {
  let changed = 0;
  for (const [id, minRarity] of Object.entries(OPTION_MIN_RARITY)) {
    const def = registry[id];
    if (!def) continue;
    const current = def.minRarity || null;
    if (current && affixRarityIndex(current) >= affixRarityIndex(minRarity)) continue;
    def.minRarity = minRarity;
    changed += 1;
  }
  return changed;
}

applyOption4RarityFloors();
