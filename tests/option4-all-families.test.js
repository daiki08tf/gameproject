import test from 'node:test';
import assert from 'node:assert/strict';
import { AFFIXES, affixRarityIndex } from '../js/data/affixes.js';
import {
  OPTION_NAME_LADDERS,
  OPTION_FAMILY_CURVES,
  canonicalOptionFamilyId,
  optionDisplayLabel,
  optionValueAtLevel,
  applyAuthoredOptionValue,
} from '../js/data/options4.js';
import { OPTION_MIN_RARITY } from '../js/data/options4RarityFloors.js';
import { buildGearInstance } from '../js/data/equipment3Gear.js';
import { equipment3Presentation } from '../js/data/equipment3Presentation.js';

const expectedCanonicalFamilies = [
  'atk_pct','mag_pct','def_pct','hp_pct','mp_pct','spd_pct','crit_pct','evasion_pct','armorpen_pct',
  'dmg_all','dmg_normal','dmg_skill','dmg_spell','dmg_boss','dmg_elite','dmg_execution','crit_damage_pct','weaken_power_pct','boss_special_mitigation',
  'lifesteal','regen','heal_on_kill','heal_on_crit','heal_on_guard',
  'mp_cost_reduce','mp_on_kill','mp_on_crit','mp_on_guard','cdr_pct','atk_speed_pct','guard_mitigation_pct',
  'gold_pct','exp_pct','drop_pct',
  'dot_dmg','dot_duration','dot_stack','dot_target_dmg','dot_mp_on_apply',
  'crit_extra_hit','crit_atk_buff','crit_spd_buff','every_n_hits','hit_low_dot','hit_low_defdown','guard_next_atk','evade_crit_buff','kill_atk_buff','spell_mag_buff','spell_mp_refund',
  'build_bloodedge','build_manaecho','build_thousandblades','build_venomheart','build_ironvengeance','build_predator','build_laststand','build_deathline','build_arcanebarrier','build_quickdraw',
  'element_fire_dmg','element_ice_dmg','element_lightning_dmg','element_wind_dmg','element_light_dmg','element_dark_dmg',
];

test('all canonical Option families have rarity names and Lv curves', () => {
  for (const familyId of expectedCanonicalFamilies) {
    assert.ok(OPTION_NAME_LADDERS[familyId], `missing name ladder: ${familyId}`);
    assert.ok(OPTION_FAMILY_CURVES[familyId], `missing curve: ${familyId}`);
    assert.equal(Object.keys(OPTION_NAME_LADDERS[familyId]).length, 7, `ladder must have seven rarities: ${familyId}`);
  }
});

test('legacy duplicate concepts share stable canonical families', () => {
  assert.equal(canonicalOptionFamilyId('build_executioner'), 'dmg_execution');
  assert.equal(canonicalOptionFamilyId('build_manacycle'), 'mp_on_crit');
  const execution = applyAuthoredOptionValue({ id:'build_executioner', rarity:'legendary', roll:1 }, { itemPower:9000, key:'execution', initializeLevel:true });
  assert.equal(execution.familyId, 'dmg_execution');
  assert.equal(execution.optionValueVersion, 2);
  assert.match(optionDisplayLabel(execution, '処刑者'), /^処刑者 Lv\d+$/);
});

test('rarity and level both increase authored power while capped families stay safe', () => {
  assert.ok(optionValueAtLevel('atk_pct','common',100) > optionValueAtLevel('atk_pct','common',1));
  assert.ok(optionValueAtLevel('atk_pct','ancient',100) > optionValueAtLevel('atk_pct','common',100));
  assert.ok(optionValueAtLevel('cdr_pct','ancient',100) <= 18);
  assert.ok(optionValueAtLevel('crit_extra_hit','ancient',100) <= 70);
  assert.ok(optionValueAtLevel('regen','ancient',100) <= 5);
  assert.ok(optionValueAtLevel('drop_pct','ancient',100) <= 20);
});

test('rarity floors make unusual utility and trigger Options genuinely rare', () => {
  assert.equal(OPTION_MIN_RARITY.gold_pct, 'rare');
  assert.equal(OPTION_MIN_RARITY.exp_pct, 'epic');
  assert.equal(OPTION_MIN_RARITY.drop_pct, 'legendary');
  assert.equal(OPTION_MIN_RARITY.crit_extra_hit, 'rare');
  assert.ok(affixRarityIndex(AFFIXES.drop_pct.minRarity) >= affixRarityIndex('legendary'));
  assert.ok(affixRarityIndex(AFFIXES.exp_pct.minRarity) >= affixRarityIndex('epic'));
});

test('new armor/accessory gear stores authoritative Option Lv/value and presents rarity-name LvXX', () => {
  const item = { id:'option4_test_acc', name:'試験護符', slot:'accessory', rarity:'mythic', stats:{ atk:1 } };
  const inst = buildGearInstance(item, { itemPowerTarget:9000, boss:true }, 'option4_test_acc#9001');
  assert.equal(inst.affixes.length, 3);
  for (const option of inst.affixes) {
    assert.equal(option.optionValueVersion, 2);
    assert.ok(option.level >= 1 && option.level <= 97);
    assert.ok(option.roll >= 0);
    assert.ok(option.familyId);
  }
  const p = equipment3Presentation(item, inst);
  assert.equal(p.affixes.length, 3);
  for (const option of p.affixes) assert.match(option.name, / Lv\d+$/);
});
