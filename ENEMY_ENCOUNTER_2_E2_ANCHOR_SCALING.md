# Enemy 2.0 / Encounter 2.0 — E2 Anchor-Safe Level Scaling

Status: **E2 COMPLETE CANDIDATE**

E2 makes Enemy Lv a real combat/reward input while preserving the E0 anchor at the stage reference level.

## Ordinary Enemy Lv

For current ordinary enemies:

- minimum: **92%** of stage base level
- midpoint: **100%**
- maximum: **108%**
- clamp: **Lv1–99,999**

Bosses remain authored at the base level in E2.

Strong/Rare/Elite bands remain deferred until those ranks are actually implemented.

## Anchor guarantee

When:

`enemy.level === enemy.baseLevel`

E2 returns the exact pre-E2 values for:

- HP
- ATK
- DEF
- SPD
- EXP
- Gold

This is the primary migration guarantee.

## Relative scaling

Scaling is intentionally mild around the anchor:

- HP exponent: 1.00
- ATK exponent: 0.85
- DEF exponent: 0.70
- SPD exponent: 0.15
- EXP exponent: 0.78
- Gold exponent: 0.62

The multiplier is based on `level / baseLevel`.

This means a +8% level roll does not automatically become +8% to every stat and reward. SPD/rewards move more gently than HP.

## Scope boundaries

E2 does not change:

- enemy species/content volume,
- fixed stage waves,
- encounter composition,
- Boss selection,
- item drop tables,
- Item Power,
- Option quality,
- currencies,
- save data,
- generic Elite behavior.

## Next

E3 adds the first **Global Species** catalog, led by the slime family, while keeping fixed waves as fallback.
