/* ============================================================
   Gear Overhaul Phase 6C — Weapon × Job × Option build lanes
   ------------------------------------------------------------
   These are authored, descriptive build routes over REAL Option families.
   They add no hidden combat bonus and therefore never make one package
   mandatory. The same data can later guide Equipment/Codex, Unique design,
   Smart Loot presets, and high-difficulty loot placement.
   ============================================================ */

const B = (id, name, jobs, options, play) => Object.freeze({
  id, name, jobs:Object.freeze(jobs), options:Object.freeze(options), play,
});

export const WEAPON_BUILD_LANES = Object.freeze({
  sword: Object.freeze([
    B('sword_guard_counter','鉄壁反撃',['warrior','merchant'],['def_pct','guard_mitigation_pct','heal_on_guard','build_ironvengeance'],'守って受け、反撃で取り返す安定型。'),
    B('sword_crit_balance','剣閃会心',['warrior','merchant'],['atk_pct','crit_pct','crit_damage_pct','crit_atk_buff'],'崩しから会心へ繋ぐ正攻法。'),
    B('sword_laststand','不屈の剣',['warrior'],['hp_pct','lifesteal','build_laststand','build_deathline'],'低HP帯を維持して押し切る高リスク型。'),
  ]),
  axe: Object.freeze([
    B('axe_breaker','破甲巨斧',['farmer','craftsman'],['atk_pct','armorpen_pct','weaken_power_pct','hit_low_defdown'],'装甲を削って重撃を通す。'),
    B('axe_predator','巨獣狩り',['farmer','craftsman'],['dmg_boss','dmg_elite','build_predator','boss_special_mitigation'],'Boss/Eliteに特化した狩猟型。'),
    B('axe_execution','断頭処刑',['craftsman'],['atk_pct','dmg_execution','build_executioner','lifesteal'],'瀕死域へ入れて一気に刈り取る。'),
  ]),
  staff: Object.freeze([
    B('staff_spellpower','純魔導',['mage','alchemist','scholar'],['mag_pct','dmg_spell','spell_mag_buff','cdr_pct'],'高威力魔法を回す王道型。'),
    B('staff_manacycle','魔力循環',['mage','scholar'],['mp_pct','mp_cost_reduce','spell_mp_refund','build_manacycle'],'MP効率を極め長期戦でも術を止めない。'),
    B('staff_echo','反響詠唱',['mage','alchemist'],['mag_pct','crit_pct','build_manaecho','spell_mag_buff'],'会心と反響で一発の魔法を連鎖させる。'),
  ]),
  bow: Object.freeze([
    B('bow_quickdraw','先制狙撃',['hunter'],['spd_pct','crit_pct','build_quickdraw','crit_damage_pct'],'先手を取り高会心の一矢を通す。'),
    B('bow_predator','巨獣狙撃',['hunter'],['dmg_boss','armorpen_pct','build_predator','dmg_skill'],'Bossの防御を抜いて精密射撃する。'),
    B('bow_volley','五月雨',['hunter'],['atk_speed_pct','crit_extra_hit','every_n_hits','crit_spd_buff'],'手数とTriggerで攻撃回数を価値へ変える。'),
  ]),
  dagger: Object.freeze([
    B('dagger_venom','毒心暗殺',['thief','ninja'],['dot_dmg','dot_duration','dot_target_dmg','build_venomheart'],'DoTを積み、毒状態の敵を削り切る。'),
    B('dagger_trigger','会心連刃',['thief','ninja'],['crit_pct','crit_extra_hit','crit_spd_buff','every_n_hits'],'多段Hitから会心Triggerを連鎖させる。'),
    B('dagger_execution','死線暗殺',['ninja'],['crit_damage_pct','build_executioner','build_deathline','lifesteal'],'死線を潜り抜け処刑域を爆発させる。'),
  ]),
  knuckle: Object.freeze([
    B('knuckle_combo','千撃連環',['fighter'],['atk_speed_pct','every_n_hits','build_thousandblades','crit_extra_hit'],'連撃数そのものを火力へ変える。'),
    B('knuckle_brawler','不倒拳',['fighter'],['hp_pct','lifesteal','regen','build_bloodedge'],'殴り続けて回復し、正面から押し切る。'),
    B('knuckle_crit','会心拳',['fighter'],['crit_pct','crit_damage_pct','heal_on_crit','crit_atk_buff'],'会心を攻防両方のエンジンにする。'),
  ]),
  instrument: Object.freeze([
    B('instrument_tempo','高速戦律',['bard','dancer'],['spd_pct','cdr_pct','atk_speed_pct','crit_spd_buff'],'速度とCDを詰めて戦律を切らさない。'),
    B('instrument_mana','循環演奏',['bard','dancer'],['mp_pct','mp_cost_reduce','spell_mp_refund','build_manacycle'],'MP循環を軸に長く演奏し続ける。'),
    B('instrument_hybrid','英雄奏者',['bard','dancer'],['atk_pct','mag_pct','dmg_skill','build_quickdraw'],'物理と魔力を両方使う攻撃的ハイブリッド。'),
  ]),
  rod: Object.freeze([
    B('rod_sustain','聖域持久',['priest','fortune'],['regen','heal_on_guard','def_pct','boss_special_mitigation'],'回復と軽減を積み長期戦を制する。'),
    B('rod_barrier','魔導防壁',['priest','fortune'],['mp_pct','mp_cost_reduce','build_arcanebarrier','boss_special_mitigation'],'高MPを維持してBoss特殊攻撃を受ける。'),
    B('rod_judgment','審判術',['priest','fortune'],['mag_pct','dmg_spell','weaken_power_pct','spell_mag_buff'],'弱体を入れながら聖光火力で削る。'),
  ]),
});

export function weaponBuildLanes(weaponType) {
  return WEAPON_BUILD_LANES[weaponType] || Object.freeze([]);
}

export function weaponBuildLaneById(id) {
  for (const lanes of Object.values(WEAPON_BUILD_LANES)) {
    const found = lanes.find((lane) => lane.id === id);
    if (found) return found;
  }
  return null;
}

/** Score only for guidance. It never modifies stats/damage. */
export function scoreWeaponBuildLane(lane, optionFamilyIds = []) {
  const owned = new Set(optionFamilyIds || []);
  const hits = lane.options.filter((id) => owned.has(id)).length;
  return { hits, total:lane.options.length, ratio:lane.options.length ? hits / lane.options.length : 0 };
}

export function bestWeaponBuildLanes(weaponType, optionFamilyIds = [], limit = 3) {
  return weaponBuildLanes(weaponType)
    .map((lane) => ({ lane, ...scoreWeaponBuildLane(lane, optionFamilyIds) }))
    .sort((a,b) => b.hits - a.hits || b.ratio - a.ratio || a.lane.id.localeCompare(b.lane.id))
    .slice(0, Math.max(1, Math.floor(Number(limit) || 3)));
}

export const WEAPON_BUILD_LANE_COUNT = Object.values(WEAPON_BUILD_LANES).reduce((n, lanes) => n + lanes.length, 0);
