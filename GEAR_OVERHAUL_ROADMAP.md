# Blade Vale — Gear Overhaul Roadmap

> Status: **ACTIVE / Phase 4 Equipment UI 3.x**
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

## Phase 3 — Existing-system consolidation ✅ COMPLETE

Goal achieved: **fewer independent power axes, deeper loot decisions**.

### Phase 3A — Temper / Greater consolidation ✅
Merged in PR #238.

- Temper retired for Option 4.0 because values are authoritative from `rarity + Option Lv`.
- Greater remains a drop-only chase identity for Option 4.0.
- crafted Greater Ascend retired for Option 4.0.
- naturally dropped Greater Option4 gear remains intact.
- legacy pre-Option4 saved Affixes keep compatibility behavior where practical.

### Phase 3B — Reroll identity ✅
Merged in PR #239.

- reroll changes **Option family**, not numeric quality.
- rerolled Option starts at Lv1 / EXP0.
- replaced Option Lv/EXP and Greater never transfer.
- old Temper/baseRoll metadata is stripped.
- value is recalculated from new rarity + Lv1.
- reroll remains random through existing generator/bias.

### Phase 3C — Fixed Identity ✅
Merged in PR #240.

- `Unique`, `Legendary Power`, and `Curse` are explicit **FIXED IDENTITY** layers.
- none consumes one of the three random Option slots.
- none gains Option Lv / EXP or participates in Option Fusion.
- Unique and Curse are immutable through ordinary Option operations.
- Legendary Power alone remains movable through extract/imprint.
- shared presentation exposes fixed identity separately from random `affixes[]` compatibility data.

### Phase 3D — Crafting/UI cleanup ✅
Current branch / PR.

Player-facing Blacksmith now communicates only the live Option 4.0 model:
- `Option育成` = deterministic numeric growth
- `Option再抽選` = family replacement, Lv1 restart
- `★Greater` = drop-only jackpot identity
- Legendary extraction/imprint = **fixed ability management**
- obsolete `数値再鍛錬` / forged-Greater presentation removed from the Option4 flow
- `Affixなし` -> `Optionなし`
- `鍛冶屋3.0` -> `Option鍛造`

## Phase 4 — Equipment UI 3.x 🔄 ACTIVE

Goal: compact mobile-first **item list + selected-item detail** layout.

Required information architecture:
- equipment category tabs
- compact item list
- selected-item detail visible without excessive scrolling
- equipment rarity / Item Power / weapon or armor type
- base stats
- FIXED IDENTITY block
- exactly up to 3 random Option rows
- Option rarity-authored name + Lv + EXP progress
- current-equipped comparison
- job/weapon compatibility and compact build tags
- lock / favorite / equip / sell / Option Fusion actions near the selected item
- preserve filters and Smart Loot without turning the screen into another giant panel

Do not pixel-copy another game's UI; reuse the reference layout idea only.

## Later phases

### Phase 5 — Smart Loot 4.0
Player-facing filtering around Option family / rarity / Lv / synergy while preserving useful Fusion materials.

### Phase 6 — Weapon Identity audit/upgrade
Strengthen the existing 24 archetypes first.

### Phase 7 — Weapon Expansion decision
Only add mastery families that pass the documented job/archetype gate.

### Phase 8 — Unique 2.0
Fixed Unique identity + up to 3 random Options; duplicate copies remain worth farming.

### Phase 9 — Loot distribution / endgame return
Give Abyss / Rift / Nemesis / Secret Realm / Deep Survey distinct farming purposes without new currencies, then resume Deep Survey expansion.

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
- #240 — Phase 3C FIXED IDENTITY separation

Current Phase 3D branch:
- obsolete Blacksmith wording removed from Option4 flow
- live operations relabeled around Option / Greater / Fixed Identity concepts
- regression coverage added
- after green CI + merge, **Phase 3 is complete and Phase 4 is active**

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
