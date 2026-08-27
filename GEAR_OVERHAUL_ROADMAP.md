# Blade Vale — Gear Overhaul Roadmap

> Status: **ACTIVE / Phase 3 Existing-system consolidation**
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
2. Named / Unique fixed effects are separate from the 3 random Option slots.
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

Fixed Identity (Named / Unique only)
  - fixed effect(s)

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
固有: Finisher時にDEFの一部を無視

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

Merged Phase 2 PRs:

- #235 — Phase 2A core/runtime
- #236 — Phase 2B inline Fusion UI
- #237 — Phase 2C tuning, milestones and Smart Loot protection

## Phase 3 — Existing-system consolidation 🔄 ACTIVE

Goal: **fewer independent power axes, deeper loot decisions**.

### Phase 3A — Temper / Greater consolidation 🔄

Decision:

- **Temper is retired for Option 4.0 gear.** Option values are authoritative from `rarity + Option Lv`; a second ±10% numeric reroll is redundant.
- **Greater remains, but as a drop-only chase identity for Option 4.0.** A naturally dropped Greater Option keeps its existing 1.5x identity.
- **Crafted Greater Ascend is retired for Option 4.0.** If Greater can always be forged, the jackpot drop loses meaning.
- Legacy pre-Option4 saved Affixes retain compatibility behavior where practical.
- Existing dropped Greater Option4 gear is never stripped.

### Phase 3B — Reroll identity

Keep reroll only because it answers a distinct question: **change the Option family**.

Target rules:

- rerolled Option starts fresh; it must not inherit the replaced Option's Lv/EXP
- reroll must not create Greater
- rarity/family generation must obey current slot/weapon bias and rarity floors
- no direct choice from the whole catalog unless a later cost/balance design explicitly justifies it

### Phase 3C — Legendary / Curse / special identity

Preserve these separately from ordinary random Options unless audit proves otherwise:

- Legendary Effect
- Curse package
- Unique fixed identity

They change item/playstyle identity rather than merely adding another numeric Option.

### Phase 3D — crafting/UI cleanup

Blacksmith should clearly communicate:

- `値＝Option Lv` for Option4 numeric growth
- `★Greater = ドロップ限定`
- reroll = family replacement
- Legendary extraction/imprint = special identity management

Do not leave dead buttons that look usable.

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

Current Phase 3A branch:

- compatibility patch blocks Temper on Option4 gear
- compatibility patch blocks Greater Ascend on Option4 gear
- naturally dropped existing Greater remains intact
- Blacksmith buttons are relabeled/disabled to explain Option4 authority
- reroll remains available and will be finalized in Phase 3B
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
9. `js/data/equipment3Greater.js`
10. `js/data/equipment3Crafting.js`
11. `js/data/equipment3SmartLoot.js`
12. `js/patches/options4Fusion.js`
13. `js/patches/gearOverhaulCraftingConsolidation.js`
14. `js/patches/equipment3Blacksmith.js`
15. `js/screens/equipmentFusion.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity by leveling, restore numeric Temper on Option4, or make Greater freely craftable without deliberately revisiting this roadmap.
