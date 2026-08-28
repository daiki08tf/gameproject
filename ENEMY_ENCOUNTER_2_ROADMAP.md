# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0–E1 ✅ / E2 ANCHOR SCALING COMPLETE CANDIDATE / E3 NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
E0 handoff: `ENEMY_ENCOUNTER_2_E0_AUDIT.md`.
E1 handoff: `ENEMY_ENCOUNTER_2_E1_LEVEL_FOUNDATION.md`.
E2 handoff: `ENEMY_ENCOUNTER_2_E2_ANCHOR_SCALING.md`.

## Goal

Move Blade Vale from fixed stage-owned enemy lists toward a reusable world ecology:

```text
Species
  × Enemy Lv
  × Region / activity
  × Variant
  × Rare / Elite rank
  ↓
Encounter Pool
  ↓
coherent random party
```

Bosses remain authored by default.

## Permanent rules

- Enemy Lv cap: 99,999
- no new currency
- no new Home screen/button
- fixed `waves` remain fallback during migration
- save compatibility mandatory
- no daily/weekly spawn loop
- generic Elite must not accidentally award Abyss-specific Elite currency
- story progression must never depend on a lucky random encounter
- existing Gear/Abyss/Rift/Secret Realm/Deep Survey reward identities remain authoritative

## Phases

| Phase | Scope | Status |
|---|---|---|
| E0 | current enemy/stat/spawn audit + balance snapshots | ✅ main |
| E1 | visible runtime Enemy Lv foundation | ✅ main |
| E2 | anchor-safe level-relative stat scaling | ✅ complete candidate |
| E3 | 10–12 Global Species, led by slime family | NEXT |
| E4 | Ch1–30 regional expansion to 7 roles + 1 Rare | queued |
| E5 | optional Encounter Pool contract + pilot chapter | queued |
| E6 | role-first Encounter Templates | queued |
| E7 | Rare / generic Elite / environmental Variant integration | queued |
| E8 | progressive Ch1–30 migration | queued |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | queued |
| E10 | existing Codex discovery polish | queued |

## E0 findings

- story encounters still use fixed `waves`,
- ordinary story generation is primarily `normal / fast / tank`,
- `BattleEngine._spawnEnemy(type)` resolves the shared `ENEMY_TYPES` registry,
- Abyss dynamically registers depth-specific enemy types before BattleEngine spawn,
- Deep Survey remains Secret Realm content and is not ordinary Abyss content,
- current `enemy.elite` is coupled to Abyss Shard payout,
- current stats are the Enemy Lv anchor stats.

## E1 implementation

Every runtime enemy receives `baseLevel` and `level`, clamped to **1–99,999**. Text Battle displays the level. E1 itself does not alter stats.

## E2 implementation

Ordinary enemies now roll within **92–108%** of the stage anchor level. Bosses stay authored at the anchor.

Scaling is relative to `level / baseLevel`:

- HP ^1.00
- ATK ^0.85
- DEF ^0.70
- SPD ^0.15
- EXP ^0.78
- Gold ^0.62

At `level === baseLevel`, every E0 stat/reward value is preserved exactly.

E2 does not touch item drops, Item Power, Option quality, fixed waves, Boss selection, save data, or generic Elite behavior.

## Enemy role target

Every story region eventually supports:

- normal
- fast
- tank
- attacker
- caster
- trickster
- support
- + one Rare identity

Existing `normal / fast / tank` are preserved as the first three roles.

## Content-volume target

- existing Ch1–30 ordinary identities: ~90
- new attacker/caster/trickster/support identities: +120
- new Chapter Rare identities: +30
- Global Species: +10–12

Target after Enemy Content Pack I: **roughly 240+ ordinary/Rare enemy identities**, excluding Bosses/special enemies.

## Global Species principle

A Global Species belongs to the world, not one Chapter.

First target includes:

`スライム / コウモリ / ゴブリン / ウルフ / スケルトン / ゴーレム / ウィスプ / 毒キノコ / 小精霊 / リザード / ミミック / 彷徨う鎧`

The slime family is the reference case: a plain slime may appear across a very wide range of content, while regional variants alter identity without replacing the base species.

## Encounter principle

Randomness is role-driven rather than slot-by-slot chaos.

Initial templates:

`mixed / pack / frontline / escort / ambush / bulwark / rare_invasion / solo_threat`

The template chooses roles first. Region/global pools resolve actual species second.

## E3 acceptance gate

E3 should add reusable species identities without yet replacing story fixed waves.

Required:

1. 10–12 Global Species in canonical data,
2. slime is the reference true-global species,
3. each species has stable `speciesId`, base role and habitat/global metadata,
4. existing Chapter enemy IDs remain valid,
5. no random Encounter Pool migration yet,
6. no generic Elite/Abyss reward collision,
7. no new currency/save root/Home route.
