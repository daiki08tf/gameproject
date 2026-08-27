# Blade Vale — Option 4.0 Canonical Catalog

> Phase 1 canonical family catalog. Stable save identity is `familyId`; display names may evolve by rarity without breaking saves.

## Rules

- Every random Option belongs to one stable `familyId`.
- Each item has at most 3 random Options.
- Option rarity and Option Lv are separate axes.
- Lv is 1–100; Lv100 is primarily a fusion/mastery endpoint.
- Fixed Unique/Legendary/Curse effects are outside the 3 random slots.
- Old Affix IDs remain readable. Where two old Affixes represent one concept, both map to the same canonical family instead of deleting save data.

## Canonical merge aliases

| Legacy Affix ID | Canonical family | Reason |
|---|---|---|
| `build_executioner` | `dmg_execution` | same execute/low-enemy-HP identity; legendary version remains mechanically stronger through its legacy effect template |
| `build_manacycle` | `mp_on_crit` | same crit-to-MP loop; build version remains the enhanced legacy effect template |

Further merges are deliberately not forced yet. Conditional lifesteal (`build_bloodedge`), Predator and other build Affixes create sufficiently different play patterns to remain distinct families for now.

## Curve groups

- `raw_pct`: ATK/MAG/DEF/HP and broad damage growth
- `medium_pct`: crit/penetration/specialized damage
- `small_pct`: CDR, mitigation, recovery and resource economy
- `regen`: regeneration with strict cap
- `proc_chance`: trigger probability with safety ceiling
- `trigger_power`: magnitude of a fixed trigger
- `discrete`: breakpoint mechanics such as hit cadence / stack cap
- `utility`: EXP/Gold/Drop with deliberately conservative growth

## Family groups

### Core stats
`atk_pct`, `mag_pct`, `def_pct`, `hp_pct`, `mp_pct`, `spd_pct`, `crit_pct`, `evasion_pct`, `armorpen_pct`

### Direct damage / target specialization
`dmg_all`, `dmg_normal`, `dmg_skill`, `dmg_spell`, `dmg_boss`, `dmg_elite`, `dmg_execution`, `crit_damage_pct`, `weaken_power_pct`, `boss_special_mitigation`

### Sustain
`lifesteal`, `regen`, `heal_on_kill`, `heal_on_crit`, `heal_on_guard`

### Resource / tempo / defense utility
`mp_cost_reduce`, `mp_on_kill`, `mp_on_crit`, `mp_on_guard`, `cdr_pct`, `atk_speed_pct`, `guard_mitigation_pct`

### Farming utility
`gold_pct`, `exp_pct`, `drop_pct`

### DoT / status
`dot_dmg`, `dot_duration`, `dot_stack`, `dot_target_dmg`, `dot_mp_on_apply`

### Triggers
`crit_extra_hit`, `crit_atk_buff`, `crit_spd_buff`, `every_n_hits`, `hit_low_dot`, `hit_low_defdown`, `guard_next_atk`, `evade_crit_buff`, `kill_atk_buff`, `spell_mag_buff`, `spell_mp_refund`

### Build chase families
`build_bloodedge`, `build_manaecho`, `dmg_execution` (legacy `build_executioner` aliases here), `build_thousandblades`, `build_venomheart`, `build_ironvengeance`, `mp_on_crit` (legacy `build_manacycle` aliases here), `build_predator`, `build_laststand`, `build_deathline`, `build_arcanebarrier`, `build_quickdraw`

### Elements
`element_fire_dmg`, `element_ice_dmg`, `element_lightning_dmg`, `element_wind_dmg`, `element_light_dmg`, `element_dark_dmg`

## Presentation target

A rolled option is presented as:

```text
<rarity-authored name> Lv<level>
<effect description>
```

Example:

```text
覇力 Lv63
ATK +18.52%
```

The old raw Affix ID/name remains only as compatibility data and debug vocabulary.
