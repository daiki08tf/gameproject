# Enemy 2.0 / Encounter 2.0 — Implementation Roadmap

Status: **E0 AUDIT COMPLETE CANDIDATE / E1 Enemy Lv NEXT**

Authoritative design: `ENEMY_ENCOUNTER_2_DESIGN.md`.
E0 handoff: `ENEMY_ENCOUNTER_2_E0_AUDIT.md`.

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
| E0 | current enemy/stat/spawn audit + balance snapshots | ✅ complete candidate |
| E1 | visible runtime Enemy Lv foundation | NEXT |
| E2 | anchor-safe level-relative stat scaling | queued |
| E3 | 10–12 Global Species, led by slime family | queued |
| E4 | Ch1–30 regional expansion to 7 roles + 1 Rare | queued |
| E5 | optional Encounter Pool contract + pilot chapter | queued |
| E6 | role-first Encounter Templates | queued |
| E7 | Rare / generic Elite / environmental Variant integration | queued |
| E8 | progressive Ch1–30 migration | queued |
| E9 | curated Abyss / Rift / Secret Realm / Deep Survey integration | queued |
| E10 | existing Codex discovery polish | queued |

## E0 findings

The current system is now locked by `npm run audit:enemy2` and `tests/enemy2-e0-audit.test.js`.

Key contracts:

- story encounters still use fixed `waves`,
- ordinary story generation is primarily `normal / fast / tank`,
- `BattleEngine._spawnEnemy(type)` resolves the shared `ENEMY_TYPES` registry,
- Abyss dynamically registers depth-specific enemy types before BattleEngine spawn,
- Deep Survey remains Secret Realm content and is not ordinary Abyss content,
- current `enemy.elite` is coupled to Abyss Shard payout, so generic Elite must not reuse that flag blindly,
- current stats are the future Enemy Lv **anchor stats** and must not be rebased during E1.

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

Current stats become the anchor at the current reference level. E1 adds level metadata only; E2 applies the relative stat multiplier around that anchor.

Initial level-roll targets for the later scaling phase:

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

## E1 acceptance gate

E1 is allowed to add runtime/visible Enemy Lv only when it preserves all E0 balance anchors.

Required:

1. every spawned enemy has `level` and `baseLevel`,
2. levels clamp to 1–99,999,
3. baseline story/Abyss/Deep Survey enemy stats remain unchanged,
4. fixed waves remain untouched,
5. Bosses receive authored/reference level metadata without random rebalance,
6. no new currency/save root/reward path,
7. generic Elite remains deferred until the Abyss payout coupling is separated.
