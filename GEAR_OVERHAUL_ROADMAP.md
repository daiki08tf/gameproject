# Blade Vale — Gear Overhaul Roadmap

> Status: **Gear Overhaul Phases 0–9 COMPLETE ✅ / NEXT: reconcile Deep Survey against final Gear loop**
>
> Loot identity is now the established endgame core. Further high-difficulty expansion must consume this loop rather than creating parallel progression.

## Core philosophy

### No Single Correct Build

Blade Vale supports two equally valid routes:

1. **Build route** — understand mechanics, combine Job / Weapon / Option synergies, and clear earlier with lower raw stats.
2. **Brute-force route** — keep farming, feed duplicate Options, raise Option Lv, stack offense / defense / sustain, and eventually overpower most encounters.

> **「知らん、火力と耐久で押し切る」も正しい攻略法。**

High-difficulty mechanics should normally be soft checks rather than hard build gates.

## Permanent Gear rules

1. Random Options are capped at **3 per item**.
2. Unique / Legendary Power / Curse fixed identities are separate from the 3 random Option slots.
3. Option rarity: `common / uncommon / rare / epic / legendary / mythic / ancient`.
4. Option Lv persists from **1–100**; rarity never auto-promotes from leveling.
5. Same-family unwanted equipment can feed Option EXP; no new currency.
6. Lv25 / 50 / 75 / 100 are mastery checkpoints; Lv100 is **MASTER**.
7. Existing saves must not be destructively rerolled or trimmed.
8. No new Home button, parallel inventory, daily/weekly loop, or FOMO system.
9. Character Lv cap remains 99,999 and Item Power cap remains 10,000.

## Target item model

```text
Equipment Base
  - equipment rarity
  - Item Power
  - base stats
  - weapon family / archetype

FIXED IDENTITY (outside random Option cap)
  - Unique fixed identity
  - Legendary Power
  - Curse

Random OPTION (max 3)
  - family
  - rarity
  - Lv1–100
  - EXP
  - resulting value
```

## Completed phases

### Phase 0 — Audit ✅
System inventory / Option audit / weapon-job audit.

### Phase 1 — Option 4.0 ✅
Max3 Options, seven rarity identities, stable `familyId / rarity / level / xp`, authored rarity names and Lv1–100 curves, legacy-save preservation. Key PRs: #229 / #230 / #231 / #234.

### Phase 2 — Option Fusion ✅
Same-family equipment material, rarity-gap efficiency, Lv25/50/75/100 milestones, low-rarity usefulness, safe material protection. Key PRs: #235 / #236 / #237.

### Phase 3 — System consolidation ✅
Temper retired for Option4, Greater drop-only, reroll = family replacement + Lv1 reset, FIXED identity separated, Blacksmith cleaned. Key PRs: #238–#241.

### Phase 4 — Equipment UI 3.x ✅
Compact list + selected detail, FIXED/Option separation, Option Lv/EXP/MASTER, compare/job/build tags, safe detail actions, compact slot/filter navigation. Key PRs: #242–#245.

### Phase 5 — Smart Loot 4.0 ✅
All-slot Option search/rarity/Lv filtering, narrow protection for Legendary Power / Curse / Greater / Ancient / Lv80+, old-save migration. Phase 5C combination editor deliberately skipped because acceptance gate was not met. Key PRs: #246 / #247.

### Phase 6 — Weapon Identity ✅
8 weapon families / 24 archetypes gained combat identities, soft 3-technique rotations, 24 build lanes, and comparative balance gates. Key PRs: #249–#252.

### Phase 7 — Weapon Expansion decision ⛔ NO-GO FOR NOW
Current archetypes already cover `大剣 / 魔導書 / 双短剣 / 弩`. Add a new mastery family only after proving a non-overlapping combat loop, Job coverage, Option bias and multiple worthwhile Named/Unique designs.

### Phase 8 — Unique 2.0 ✅

Full handoff: `GEAR_OVERHAUL_PHASE8_UNIQUE2.md`.

- 16 authored gameplay-loop identities across all 8 current weapon families.
- 8/8 families have Named Unique weapon coverage.
- duplicate Named drops remain distinct instances with max-three random Options.
- effect-kind balance envelopes prevent proc / echo / DoT / execution / Boss-specialization runaway.
- existing `UNIQUE FIXED` detail shows authored identity name + combat-loop explanation.
- no new equipment screen, Home button, currency or save root.

### Phase 9 — Loot Distribution / Endgame Return ✅ COMPLETE

Full handoff: `GEAR_OVERHAUL_PHASE9_LOOT_DISTRIBUTION.md`.

#### 9A — Named Unique target farms ✅

| Weapon | Existing target farm |
|---|---|
| 終王斧グリムヘッド | Abyss Armory Boss floor, depth >= 1200 |
| 連星拳アルカ | Abyss Armory, depth >= 1800 |
| 残光弓アステリオン | Wind / Lightning Rift, one 6% clear roll |
| 葬毒刃ミアズマ | Poison / Dark Rift, one 6% clear roll |
| 戦律器カデンツァ | Secret Realm: Inverted Library |
| 反照錫セラフィム | Final Eighth Key |

Implementation: `js/data/gearOverhaulPhase9TargetFarm.js`. PR #256 introduced the map; Phase 9C corrected Rift delivery after validating live `_rollDrop()` behavior.

#### 9B — activity-role separation ✅

`js/data/endgameLootRoles.js` defines explicit purposes:

- **Abyss** — Option / raw-equipment repeatable chase; Armory weapon/Set/Named pressure.
- **Rift** — Greater / Ancient / burst-quality opportunities; element-key target farms.
- **Nemesis / EX** — rival / enemy-themed high-risk rewards and hunt-mode efficiency.
- **Secret Realm** — authored Named / Build Identity / discovery chase.

The existing Home `NEXT` card shows one compact **目的別ファーム** line. No new screen or Home button.

#### 9C — loop validation ✅

Validation covers actual stage builders, wrong-route/element exclusion, bounded Named table share, Rift one-roll-per-clear behavior, and deterministic 20,000-trial simulation around the authored 6% Rift chase rate.

Permanent result:

`high difficulty → target gear → evaluate max-three Options → Option Fusion/build refinement → deeper difficulty`

No single Unique may become a hard progression gate. Intended builds clear earlier; extreme farming/brute force remains viable.

## NEXT — Deep Survey reconciliation

The paused Deep Survey work is now the next default task, but it must be reconciled against the finished Gear Overhaul first.

Do **not** revive the old branch unchanged if it assumes pre-Option4 loot behavior or generic high-level rewards.

Deep Survey should become:
- the hardest **mixed chase** using existing Gear systems,
- a place where high-Option / Greater / Named / build refinement all matter,
- an extension of existing Secret Realm / Abyss structures,
- not a new currency, Home button, save root, daily/weekly loop or parallel progression track.

Before implementation, inspect the paused Deep Survey PR/branch and decide which parts survive the Gear Overhaul.

## AI handoff

Read before continuing:

1. `ROADMAP.md`
2. `GEAR_OVERHAUL_ROADMAP.md`
3. `GEAR_OVERHAUL_PHASE9_LOOT_DISTRIBUTION.md`
4. `GEAR_OVERHAUL_PHASE8_UNIQUE2.md`
5. `GEAR_OVERHAUL_PHASE6_WEAPON_IDENTITY.md`
6. `GEAR_OVERHAUL_AUDIT.md`
7. `GEAR_OVERHAUL_OPTION_CATALOG.md`
8. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
9. `js/data/gearOverhaulPhase9TargetFarm.js`
10. `js/data/endgameLootRoles.js`
11. `js/data/unique2IdentityLibrary.js`
12. `js/data/uniqueEquipment.js`
13. `js/data/equipmentFixedIdentity.js`
14. `js/data/weaponIdentity.js`
15. `js/data/weaponTechniqueRotation.js`
16. `js/data/weaponBuildSynergy.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity, restore numeric Temper, make Greater freely craftable, let reroll inherit old Option Lv/EXP, mix FIXED identity into random Options, or add a new weapon family merely for variety.
