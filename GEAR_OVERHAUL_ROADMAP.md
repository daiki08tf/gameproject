# Blade Vale — Gear Overhaul Roadmap

> Status: **ACTIVE / Phase 3C Fixed Identity**
>
> Gear Overhaul continues to take priority over further Deep Survey expansion. High-difficulty content becomes more valuable after the loot loop itself is worth farming.

## Core philosophy

### No Single Correct Build

Blade Vale must support two equally valid routes:

1. **Build route** — understand mechanics, combine job / weapon / Option synergies, and clear content earlier with lower raw stats.
2. **Brute-force route** — keep farming, feed duplicate Options, raise Option Lv, stack offense / defense / sustain, and eventually overpower most encounters.

> **「知らん、火力と耐久で押し切る」も正しい攻略法。**

High-difficulty mechanics should therefore be soft checks rather than hard build gates wherever possible.

## Permanent Gear rules

1. Random Options are capped at **3 per item**.
2. Unique / Legendary / Curse fixed identities are **separate from the 3 random Option slots**.
3. Option rarity remains seven tiers: `common / uncommon / rare / epic / legendary / mythic / ancient`.
4. Option Lv is persistent **1–100** and rarity never auto-promotes from leveling.
5. Same-family unwanted equipment can be consumed for Option EXP; no new currency.
6. Lv25 / 50 / 75 / 100 are visible mastery checkpoints; Lv100 is **MASTER**.
7. Existing saves must not be destructively rerolled or trimmed.
8. Do not add a new Home button, parallel inventory, daily/weekly loop, or FOMO system.
9. Character Lv cap remains 99,999 and Item Power cap remains 10,000.

## Target item model

```text
Equipment Base
  - equipment rarity
  - Item Power
  - base stats
  - weapon family / archetype when applicable

FIXED IDENTITY (outside random Option cap)
  - Unique fixed identity, when item.unique
  - Legendary Power, when rolled/imprinted
  - Curse, when rolled

Random OPTION (max 3)
  - family
  - rarity
  - Lv1–100
  - EXP
  - resulting value
```

Example:

```text
神話・断界の大剣 +146
【固有】Finisher時にDEFの一部を無視
《固定能力：雷神の心臓》会心時に追撃

OPTION
- 覇力 Lv63
- 神眼 Lv41
- 吸命 Lv72
```

## Option rarity identity

Rarity is communicated through the Option name itself. Example ATK ladder:

`怪力 → 剛力 → 豪腕 → 鬼力 → 覇力 → 神力 → 天威`

All canonical families have authored rarity-name ladders and Lv curves.

## Phase 2 — Option Fusion ✅ COMPLETE

Full handoff: `GEAR_OVERHAUL_PHASE2_FUSION.md`.

Implemented:

- same canonical family equipment-as-material Fusion
- deterministic Option EXP
- 100 / 80 / 60 / 40 / 20% rarity-gap efficiency
- material rarity and material Lv affect EXP yield
- nonlinear ~62k total Lv1→100 curve
- low-rarity material remains useful
- Lv25 / 50 / 75 / 100 milestone reporting
- Lv100 MASTER feedback
- locked / favorite / equipped / same-item protection
- inline existing-Equipment-screen UI
- Smart Loot protects Ancient or Lv80+ valuable Fusion materials across equipment slots
- no new currency / Home button / parallel inventory

Merged Phase 2 PRs: #235 / #236 / #237.

## Phase 3 — Existing-system consolidation 🔄 ACTIVE

Goal: **fewer independent power axes, deeper loot decisions**.

### Phase 3A — Temper / Greater consolidation ✅

Merged in PR #238.

- Temper retired for Option 4.0 because Option values are authoritative from `rarity + Option Lv`.
- Greater remains as a drop-only chase identity for Option 4.0.
- crafted Greater Ascend retired for Option 4.0.
- naturally dropped Greater Option4 gear remains intact.
- legacy pre-Option4 saved Affixes keep compatibility behavior where practical.
- Blacksmith communicates `値＝Option Lv` and `★ドロップ限定` instead of exposing dead growth axes.

### Phase 3B — Reroll identity ✅

Merged in PR #239.

Reroll exists for one distinct reason: **change the Option family**.

- rerolled Option always starts at **Lv1 / EXP0**
- replaced Option Lv/EXP never transfers
- reroll cannot create or inherit Greater
- old Temper/baseRoll metadata is stripped
- resulting value is recalculated from the new Option rarity + Lv1 curve
- reroll remains random through the existing generator/bias
- UI calls it `Option再抽選` and warns that growth restarts

Armor/accessory reroll generalization remains deferred to a deliberate all-slot crafting pass.

### Phase 3C — Legendary / Curse / Unique fixed identity 🔄

Decision: these are **FIXED IDENTITY**, not random Options.

- `Unique` — item-authored fixed identity/effects; immutable through ordinary Option operations.
- `Legendary Power` — extra fixed playstyle effect; may be moved only through the existing extract/imprint flow.
- `Curse` — fixed tradeoff package; not an Option family and not Option-Fusion eligible.
- none of these consumes one of the three random Option slots.
- none gains Option Lv or Option EXP.
- none can be used as same-family Option Fusion material.
- shared presentation exposes them through `fixedIdentities[]`, while ordinary random Options remain in `affixes[]` for save/runtime compatibility.

Phase 3C implementation files:
- `js/data/equipmentFixedIdentity.js`
- `js/data/equipment3Presentation.js`
- `tests/gear-overhaul-phase3c-fixed-identity.test.js`

### Phase 3D — crafting/UI cleanup

Final pass after 3C:

- no obsolete-looking active buttons
- clear `Option` wording instead of legacy `Affix` wording where user-facing
- reroll = family replacement
- Legendary extraction/imprint = fixed-identity management
- Unique/Curse clearly read as fixed identity, not Option rows

## Weapon expansion rule

Do not add a ninth mastery family merely because a fantasy weapon sounds cool.

A candidate family must have multiple plausible jobs, a distinct gameplay identity, unique Option weighting, Named/Unique room, and no destructive effect on mastery/save assumptions.

Current Equipment 3.0 already provides 24 sub-archetypes across 8 mastery families including 大剣 / 刀 / 魔導書 / 双短剣 / 弩 / 大斧. Strengthen those first.

## Implementation checkpoint — 2026-08-27

Merged:

- #229 — audit/docs + Option compatibility + Fusion weapon metadata
- #230 — max-3 new weapon Options
- #231 — `familyId / rarity / level / xp` persistence
- #234 — Phase 1 complete: canonical rarity identities and Lv curves
- #235 — Phase 2A Fusion core
- #236 — Phase 2B Fusion UI
- #237 — Phase 2C tuning / milestones / material protection
- #238 — Phase 3A Temper / Greater consolidation
- #239 — Phase 3B Option reroll identity

Current Phase 3C branch:

- explicit FIXED IDENTITY data model
- Unique / Legendary / Curse separated from random Option presentation
- fixed identities do not consume the max-three Option cap
- fixed identities are not Option Fusion targets/materials
- Legendary Power remains the only mutable fixed identity via extract/imprint
- regression coverage added

## Work phases

### Phase 0A — System inventory ✅
### Phase 0B — Affix / Option audit ✅
### Phase 0C — Weapon × Job audit ✅
### Phase 1 — Option 4.0 ✅
### Phase 2 — Option Fusion ✅
### Phase 3 — Existing-system consolidation 🔄 ACTIVE
### Phase 4 — Equipment UI 3.x
### Phase 5 — Smart Loot 4.0
### Phase 6 — Weapon Identity audit/upgrade
### Phase 7 — Weapon Expansion decision
### Phase 8 — Unique 2.0
### Phase 9 — Loot distribution / endgame return

After the gear loop is finished, resume Deep Survey expansion.

## AI handoff

Read before continuing:

1. `ROADMAP.md`
2. `GEAR_OVERHAUL_ROADMAP.md`
3. `GEAR_OVERHAUL_AUDIT.md`
4. `GEAR_OVERHAUL_OPTION_CATALOG.md`
5. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
6. `GEAR_OVERHAUL_PHASE2_FUSION.md`
7. `js/data/options4.js`
8. `js/data/options4Fusion.js`
9. `js/data/equipmentFixedIdentity.js`
10. `js/data/equipment3Legendary.js`
11. `js/data/equipment3Greater.js`
12. `js/data/equipment3Crafting.js`
13. `js/data/equipment3SmartLoot.js`
14. `js/patches/options4Fusion.js`
15. `js/patches/gearOverhaulCraftingConsolidation.js`
16. `js/patches/equipment3Blacksmith.js`
17. `js/screens/equipmentFusion.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity by leveling, restore numeric Temper on Option4, make Greater freely craftable, let reroll inherit old Option Lv/EXP, or mix FIXED IDENTITY into the three random Option slots.
