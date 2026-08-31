# CLR-17 — Stage / Region Loot Identity Handoff

## Goal

Give Stage-first Hunt a concrete replay reason without creating a new loot system:

> 「このAffix系統を狙うから、このRegionを周回する」

## Implemented first vertical slice

The two Regions already on the shared CLR combat-first route receive distinct target-farm identities:

- `frontier` — **前線装備**
  - favors `atk_pct`, `def_pct`, `hp_pct`, `dmg_boss`
  - player-facing identity: physical pressure, durability, strong-enemy fighting
- `elemental` — **元素装備**
  - favors `mag_pct`, `mp_pct`, `dmg_spell`, `spd_pct`
  - player-facing identity: magic, resource economy, spell damage, speed

Both use a bounded `0.28` target-affix chance.

## Authority contract

CLR-17 does **not** add:

- a new drop table,
- a new rarity,
- Hunt currency / Hunt XP / Hunt level,
- a new inventory,
- new Item Power math,
- duplicate Unique acquisition.

Instead it reuses the existing `loot3RealmTargetFarm` Affix steering bridge. Existing specialized target-farm context wins over Region context.

## Hunt-only scope

Region steering is applied only while the existing `adventure4` session is active on a `*-free-adventure` route. Canonical Story battles do not receive the Region Hunt bias.

## Enemy / danger identity

CLR-17 intentionally reuses the already-authored Region Stage pools and CLR combat-first cadence. Elite / Boss nodes remain the existing escalation mechanism; no duplicate enemy authority is introduced.

The Stage detail now communicates:

- Region loot identity,
- what Affix family is worth hunting there,
- that deeper Elite/Boss progression increases ordinary battle reward opportunities,
- that Item Power, rarity and Unique rules remain canonical.

## Generalization boundary

Only `frontier` and `elemental` get target profiles in CLR-17 because they are the Regions already using the shared CLR combat-first Hunt route. CLR-19 remains responsible for generalizing Hunt and data-driven Region profiles across the remaining eligible Regions.

## Next

**CLR-18 — Story Density Migration by Chapter**

Preserve the visible `1-1 → 1-2 → ...` Stage spine while moving suitable exposition behind combat outcomes and keeping replay combat-first.
