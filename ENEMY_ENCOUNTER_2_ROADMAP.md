# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **DESIGN COMPLETE / IMPLEMENTATION NOT STARTED**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.

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
| E0 | current enemy/stat/spawn audit + balance snapshots | NEXT |
| E1 | visible runtime Enemy Lv foundation | queued |
| E2 | anchor-safe level-relative stat scaling | queued |
| E3 | 10–12 Global Species, led by slime family | queued |
| E4 | Ch1–30 regional expansion to 7 roles + 1 Rare | queued |
| E5 | optional Encounter Pool contract + pilot chapter | queued |
| E6 | role-first Encounter Templates | queued |
| E7 | Rare / generic Elite / environmental Variant integration | queued |
| E8 | progressive Ch1–30 migration | queued |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | queued |
| E10 | existing Codex discovery polish | queued |

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

## Enemy Lv principle

Do not replace current Chapter scaling on day one.

Current stats become the anchor at the current reference level. Runtime Enemy Lv applies a relative multiplier around that anchor, so migration does not silently rebalance the whole game.

Initial level-roll targets:

- ordinary: 92–108% of stage recLevel
- strong: 105–118%
- Rare: 115–135%
- Elite: 120–145%
- Boss: authored / normally around 100–112%

All clamp to Lv1–99,999.

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

## Recommended first implementation

Do **E0 only** first.

E0 must answer before code migration:

1. every current enemy source,
2. every direct `ENEMY_TYPES` consumer,
3. current enemy stats vs stage `recLevel`,
4. current kill EXP/Gold assumptions,
5. every use of `enemy.elite`,
6. Boss AI assumptions tied to enemy IDs,
7. Abyss/Rift/Secret Realm enemy builders,
8. regression snapshots for representative Ch1 / Ch10 / Ch20 / Ch30 / Abyss / Deep Survey encounters.

Only after E0 is green should E1 add visible Enemy Lv.
