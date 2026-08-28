# Blade Vale — Gear Overhaul Roadmap

> Status: **Phase 8 Unique 2.0 COMPLETE ✅ / NEXT: Phase 9 Loot Distribution & Endgame Return**
>
> Gear/content depth remains the priority over further Deep Survey expansion or large visual redesigns. Make loot worth farming first, then reconnect it to high difficulty.

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
All-slot Option search/rarity/Lv filtering, narrow protection for Legendary Power / Curse / Greater / Ancient / Lv80+, old-save migration. Phase 5C combination editor deliberately skipped because acceptance gate was not met. Phase 5D removed obsolete visible Affix controls. Key PRs: #246 / #247.

### Phase 6 — Weapon Identity ✅
8 weapon families / 24 archetypes gained combat identities, soft 3-technique rotations, 24 build lanes, and comparative balance gates. Key PRs: #249–#252.

### Phase 7 — Weapon Expansion decision ⛔ NO-GO FOR NOW
Current archetypes already cover `大剣 / 魔導書 / 双短剣 / 弩`. Add a new mastery family only after proving a non-overlapping combat loop, Job coverage, Option bias and multiple worthwhile Named/Unique designs.

### Phase 8 — Unique 2.0 ✅ COMPLETE

Full handoff: `GEAR_OVERHAUL_PHASE8_UNIQUE2.md`.

#### 8A — inventory / architecture audit ✅
Existing Unique / Legendary / FIXED identity architecture reused; no parallel Unique system.

#### 8B — identity library ✅
16 authored gameplay-loop identities across all 8 current weapon families, tied to existing Phase 6 build lanes.

#### 8C — Named weapon coverage & duplicate chase ✅
- existing sword/staff Named weapons mapped into Unique 2.0
- six Mythic Named weapons fill axe / bow / dagger / knuckle / instrument / rod gaps
- 8/8 weapon families now have Named Unique coverage
- duplicate drops remain distinct weapon instances with max-three random Options
- legacy saved 4–5 Option weapons remain untouched
- six new weapons remain distribution-pending for Phase 9

#### 8D — balance & presentation ✅
- effect-kind regression envelopes cover proc / echo / DoT / execution / diversity / guard / Boss specialization / sustain
- extra-hit and DoT identities preserve per-action caps; spell echo remains spell-only
- Boss specialization requires explicit opportunity cost in authored recipes
- existing `UNIQUE FIXED` detail now shows authored identity name + combat-loop explanation
- legacy Unique presentation remains unchanged when no Unique 2.0 mapping exists
- no new equipment screen or Home button

## NEXT — Phase 9 Loot Distribution / Endgame Return

Purpose: make existing endgame activities answer different loot questions instead of all being generic high-level farming.

Target structure, using existing systems only:

- **Abyss** — depth-scaled high-Option / Option-rarity pressure and repeatable raw gear chase.
- **Rift / World Event** — broad Greater / high-quality burst opportunities.
- **Nemesis / EX bounty** — targeted Named / Unique enemy-themed chase.
- **Secret Realm** — authored Named / build-identity chase and discovery reward.
- **Deep Survey** — hardest mixed chase after its paused PR is reconciled; not a new currency or parallel progression.

Phase 9 should first inventory live drop hooks and map the six `distributionPending` Named weapons onto existing activities. Only then resume/repair Deep Survey expansion.

Target loop:

`high difficulty → chase Named/Unique/Greater/high-Option gear → Option Fusion/build refinement → deeper difficulty`

## AI handoff

Read before continuing:

1. `ROADMAP.md`
2. `GEAR_OVERHAUL_ROADMAP.md`
3. `GEAR_OVERHAUL_PHASE8_UNIQUE2.md`
4. `GEAR_OVERHAUL_PHASE6_WEAPON_IDENTITY.md`
5. `GEAR_OVERHAUL_AUDIT.md`
6. `GEAR_OVERHAUL_OPTION_CATALOG.md`
7. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
8. `GEAR_OVERHAUL_PHASE2_FUSION.md`
9. `GEAR_OVERHAUL_PHASE4_UI.md`
10. `js/data/unique2IdentityLibrary.js`
11. `js/data/uniqueEquipment.js`
12. `js/data/equipmentFixedIdentity.js`
13. `js/data/weaponIdentity.js`
14. `js/data/weaponTechniqueRotation.js`
15. `js/data/weaponBuildSynergy.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity, restore numeric Temper, make Greater freely craftable, let reroll inherit old Option Lv/EXP, mix FIXED identity into random Options, or add a new weapon family merely for variety.
