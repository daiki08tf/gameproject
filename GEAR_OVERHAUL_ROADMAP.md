# Blade Vale — Gear Overhaul Roadmap

> Status: **Phase 8 Unique 2.0 ACTIVE — 8A audit ✅ / 8B identity library ✅ / 8C Named coverage & duplicate chase ✅ / NEXT: 8D balance & presentation**
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

### Phase 6 — Weapon Identity ✅ COMPLETE

Full handoff: `GEAR_OVERHAUL_PHASE6_WEAPON_IDENTITY.md`.

#### 6A — 8 family / 24 archetype combat identity ✅
Existing archetypes specialize existing Weapon Techniques rather than only changing base stats. PR #249.

#### 6B — soft three-technique rotations ✅
Existing Lv1 / Lv100 / Lv350 Weapon Techniques form optional `Opener → Setup → Finisher` chains with family-specific rewards. No meter/save/currency; Job skills and normal attacks can be woven between. PR #250.

#### 6C — Job × Weapon × Option build lanes ✅
Three credible routes per family (24 authored lanes total), built only from live Option families. Routes are guidance/content data and add no hidden bonus. One-family-one-package is explicitly forbidden. PR #251.

#### 6D — balance / closeout ✅
Comparative regression gates cover all 24 archetypes and all three techniques, including earned Setup/Finisher bonuses. Raw packet, hit count, Crit, Armor Pen, Weaken, MP and execution values are bounded. Rapid-hit archetypes are proc-focused rather than free burst multipliers. PR #252.

## Phase 7 — Weapon Expansion decision ⛔ NO-GO FOR NOW

Do **not** add a new mastery family yet. Current archetypes already include `大剣 / 魔導書 / 双短剣 / 弩`, so those are not missing families.

Re-evaluate after Unique 2.0 only if a candidate weapon has:
- a genuinely non-overlapping combat loop,
- credible Basic/Fusion Job coverage,
- distinct Option bias,
- multiple worthwhile Named/Unique designs,
- more value than deepening the existing 8-family/24-archetype set.

## Phase 8 — Unique 2.0 🔄 ACTIVE

Full handoff: `GEAR_OVERHAUL_PHASE8_UNIQUE2.md`.

Goal: make Named/Unique equipment change gameplay, not merely raise numbers.

Permanent structure:

```text
Unique base item
+ gameplay-changing FIXED identity
+ up to 3 random Options
```

Duplicate Unique drops remain valuable because random Options / rarity / Option Lv can differ.

### 8A — Unique inventory / audit ✅
- existing architecture correctly separates `UNIQUE FIXED` from Options
- existing content was concentrated in accessories / swords / shields
- reuse `uniqueEquipment.js`, `equipmentFixedIdentity.js`, `equipment3Legendary.js`; no parallel Unique system

### 8B — Unique identity library ✅
- `js/data/unique2IdentityLibrary.js`
- 8 current weapon families covered
- 2 gameplay-loop identities per family = 16 recipes
- recipes reference existing Phase 6 build lanes and live combat-effect vocabulary
- recipes create no drop/stat/currency/save root by themselves

### 8C — Named / Unique content pass ✅
- existing `血牙グラム` and `星詠みの杖` mapped into Unique 2.0
- six new Mythic Named weapons fill axe / bow / dagger / knuckle / instrument / rod gaps
- all 8 current weapon families now have at least one Named Unique weapon with explicit combat-loop identity
- new Named weapons remain `distributionPending:true`; Phase 9 will place them in existing endgame loops
- duplicate-copy regression verifies distinct weapon instances, max-three random Options and preserved FIXED identity
- old saved 4–5 Option weapons remain untouched

### NEXT: 8D — balance / presentation
- regression-gate proc / echo / DoT / execution / guard / Boss-specialization values
- preserve per-action / anti-chain limits
- surface Unique 2.0 identity name and gameplay loop in the existing compact Equipment detail
- no new screen / Home button
- confirm multiple Phase 6 routes remain credible per family

## Phase 9 — Loot distribution / endgame return

Give Abyss / Rift / Nemesis / Secret Realm / Deep Survey distinct farming purposes without new currencies, then resume Deep Survey expansion.

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
11. `js/data/weaponIdentity.js`
12. `js/data/weaponTechniqueRotation.js`
13. `js/data/weaponBuildSynergy.js`
14. `js/data/uniqueEquipment.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity, restore numeric Temper, make Greater freely craftable, let reroll inherit old Option Lv/EXP, mix FIXED identity into random Options, or add a new weapon family merely for variety.
