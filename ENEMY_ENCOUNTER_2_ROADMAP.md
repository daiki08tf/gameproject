# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0 AUDIT ✅ / E1 Enemy Lv COMPLETE CANDIDATE / E2 NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
E0 handoff: `ENEMY_ENCOUNTER_2_E0_AUDIT.md`.
E1 handoff: `ENEMY_ENCOUNTER_2_E1_LEVEL_FOUNDATION.md`.

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
| E1 | visible runtime Enemy Lv foundation | ✅ complete candidate |
| E2 | anchor-safe level-relative stat scaling | NEXT |
| E3 | 10–12 Global Species, led by slime family | queued |
| E4 | Ch1–30 regional expansion to 7 roles + 1 Rare | queued |
| E5 | optional Encounter Pool contract + pilot chapter | queued |
| E6 | role-first Encounter Templates | queued |
| E7 | Rare / generic Elite / environmental Variant integration | queued |
| E8 | progressive Ch1–30 migration | queued |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | queued |
| E10 | existing Codex discovery polish | queued |

## E0 findings

The current system is locked by `npm run audit:enemy2` and `tests/enemy2-e0-audit.test.js`.

Key contracts:

- story encounters still use fixed `waves`,
- ordinary story generation is primarily `normal / fast / tank`,
- `BattleEngine._spawnEnemy(type)` resolves the shared `ENEMY_TYPES` registry,
- Abyss dynamically registers depth-specific enemy types before BattleEngine spawn,
- Deep Survey remains Secret Realm content and is not ordinary Abyss content,
- current `enemy.elite` is coupled to Abyss Shard payout, so generic Elite must not reuse that flag blindly,
- current stats are the Enemy Lv anchor stats.

## E1 implementation

Every runtime enemy now receives `baseLevel` and `level`, clamped to **1–99,999**.

At E1:

- source is authored `enemyLevelBase` or stage `recLevel`,
- `level === baseLevel`,
- Text Battle displays Enemy Lv,
- HP / ATK / DEF / SPD / EXP / Gold are unchanged,
- fixed waves and all existing reward paths are unchanged.

This intentionally makes Enemy Lv observable before it becomes a balance input.

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

Current stats are the anchor at the current reference level. E2 applies relative scaling around that anchor rather than replacing Chapter scaling.

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

## E2 acceptance gate

E2 may add level-relative rolls and stat scaling only when:

1. an enemy at `level === baseLevel` has exactly the E0 stats,
2. ordinary level rolls stay within the authored bounded range,
3. scaling clamps safely at Lv1 and Lv99,999,
4. Bosses remain authored by default,
5. EXP/Gold do not double-count existing Chapter/Abyss progression,
6. fixed waves remain untouched,
7. generic Elite remains deferred until its Abyss reward coupling is separated.
