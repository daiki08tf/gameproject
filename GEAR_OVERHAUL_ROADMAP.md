# Blade Vale — Gear Overhaul Roadmap

> Status: **ACTIVE / Phase 5 Smart Loot 4.0**
>
> Gear Overhaul continues to take priority over further Deep Survey expansion. The loot loop should be worth farming before more high-difficulty content is layered on top.

## Core philosophy

### No Single Correct Build

Blade Vale supports two equally valid routes:

1. **Build route** — understand mechanics, combine job / weapon / Option synergies, and clear content earlier with lower raw stats.
2. **Brute-force route** — keep farming, feed duplicate Options, raise Option Lv, stack offense / defense / sustain, and eventually overpower most encounters.

> **「知らん、火力と耐久で押し切る」も正しい攻略法。**

High-difficulty mechanics should normally be soft checks rather than hard build gates.

## Permanent Gear rules

1. Random Options are capped at **3 per item**.
2. Unique / Legendary / Curse fixed identities are separate from the 3 random Option slots.
3. Option rarity remains `common / uncommon / rare / epic / legendary / mythic / ancient`.
4. Option Lv is persistent **1–100**; rarity never auto-promotes from leveling.
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

Example ATK rarity ladder:

`怪力 → 剛力 → 豪腕 → 鬼力 → 覇力 → 神力 → 天威`

## Completed phases

### Phase 0 — Audit ✅

- 8 mastery weapon families / 24 archetypes
- 15 basic jobs / 105 Fusion Jobs
- legacy Affix catalog audited and canonical Option families documented
- weapon/job compatibility audited before any weapon-family expansion

Docs:
- `GEAR_OVERHAUL_AUDIT.md`
- `GEAR_OVERHAUL_OPTION_CATALOG.md`
- `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`

### Phase 1 — Option 4.0 ✅

- max 3 random Options
- seven rarity identities
- stable `familyId / rarity / level / xp`
- authored rarity-name ladders and Lv1–100 value curves
- source/IP starting Option Lv
- rarity + Option Lv authoritative values
- old saved gear preserved without destructive trimming/reroll

Key PRs: #229 / #230 / #231 / #234.

### Phase 2 — Option Fusion ✅

Full handoff: `GEAR_OVERHAUL_PHASE2_FUSION.md`.

- same-family equipment-as-material Fusion
- deterministic Option EXP
- rarity-gap efficiency 100 / 80 / 60 / 40 / 20%
- nonlinear ~62k total Lv1→100 curve
- low-rarity materials remain useful
- Lv25 / 50 / 75 / 100 milestones and MASTER
- lock / favorite / equipped / same-item protection
- inline Equipment-screen Fusion UI
- Ancient or Lv80+ material protected by Smart Loot

Key PRs: #235 / #236 / #237.

### Phase 3 — Existing-system consolidation ✅

- numeric Temper retired for Option4
- Greater remains **drop-only** for Option4
- crafted Greater Ascend retired for Option4
- reroll = Option-family replacement, always Lv1 / EXP0
- Unique / Legendary Power / Curse formalized as **FIXED IDENTITY** outside random Options/Fusion
- Legendary Power remains movable only through extract/imprint
- Blacksmith wording cleaned around live Option4 concepts

Key PRs: #238 / #239 / #240 / #241.

### Phase 4 — Equipment UI 3.x ✅

Full handoff: `GEAR_OVERHAUL_PHASE4_UI.md`.

- selected-item detail layout
- mobile single-column / wide list-left-detail-right layout
- compact inventory rows instead of repeated giant item cards
- FIXED IDENTITY separated from max-three Options
- Option Lv / EXP / MASTER visible in detail
- current-equipped comparison / job compatibility / build tags
- selected-detail equip / KEEP / lock / OP育成 actions relay existing safe logic
- six equipped slots compacted to 3×2 category grid
- normal filters compacted to one horizontal strip
- advanced filters consume vertical space only when opened

Key PRs: #242 / #243 / #244 / Phase 4D closeout PR.

## Phase 5 — Smart Loot 4.0 🔄 ACTIVE

Goal: make long farming sessions manageable without hiding useful Fusion material or turning Equipment back into a giant form.

### Phase 5A — All-slot Option filters

Add compact player-facing filters for:

- Option family / text query
- minimum Option rarity
- minimum Option Lv
- current slot already selected by Equipment category

Unlike old Equipment 3.0 details, these rules must work consistently for weapon / shield / head / body / accessory.

### Phase 5B — Protection rules

Keep existing automatic protection for:

- Ancient Option
- Option Lv80+
- Legendary Power / Curse / high-value Greater conditions already protected by Smart Loot

Add Option-aware protection only where it prevents accidental loss; ordinary mid-tier same-family material must stay feedable.

### Phase 5C — Useful synergy filters

Only add filters that reduce farming burden, e.g.:

- contains 2+ desired Option families/categories
- build-tag combination

Do **not** create a giant Boolean filter builder.

### Phase 5D — UI / migration closeout

- `Affix` player-facing wording -> `Option` where appropriate
- preserve old save filter fields through normalization
- test all slots and mobile filter footprint
- no new screen or save root

## Later phases

### Phase 6 — Weapon Identity audit/upgrade
Strengthen the existing 24 archetypes before adding mastery families.

### Phase 7 — Weapon Expansion decision
Only add weapon families that pass the documented job/archetype gate.

### Phase 8 — Unique 2.0
Fixed Unique identity + up to 3 random Options; duplicate copies remain worth farming.

### Phase 9 — Loot distribution / endgame return
Give Abyss / Rift / Nemesis / Secret Realm / Deep Survey distinct farming purposes without new currencies, then resume Deep Survey expansion.

## Implementation checkpoint — 2026-08-27

Merged through:
- #229–#231 Option foundation
- #234 Phase 1 closeout
- #235–#237 Option Fusion
- #238–#241 consolidation / Fixed Identity / Blacksmith cleanup
- #242 Phase 4A selected detail
- #243 Phase 4B compact list
- #244 Phase 4C detail actions

Current Phase 4D closeout branch:
- compact 3×2 slot/category navigation
- horizontal normal filter strip
- reduced Equipment header footprint
- advanced filter panel remains explicit/expandable
- after green CI + merge, **Phase 4 is complete and Phase 5 is active**

## AI handoff

Read before continuing:

1. `ROADMAP.md`
2. `GEAR_OVERHAUL_ROADMAP.md`
3. `GEAR_OVERHAUL_AUDIT.md`
4. `GEAR_OVERHAUL_OPTION_CATALOG.md`
5. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
6. `GEAR_OVERHAUL_PHASE2_FUSION.md`
7. `GEAR_OVERHAUL_PHASE4_UI.md`
8. `js/data/options4.js`
9. `js/data/options4Fusion.js`
10. `js/data/equipmentFixedIdentity.js`
11. `js/data/equipment3SmartLoot.js`
12. `js/patches/options4Fusion.js`
13. `js/patches/equipment3SmartLoot.js`
14. `js/patches/gearOverhaulCraftingConsolidation.js`
15. `js/screens/equipmentFusion.js`
16. `js/screens/equipment4.js`
17. `css/equipment4.css`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity by leveling, restore numeric Temper on Option4, make Greater freely craftable, let reroll inherit old Option Lv/EXP, mix FIXED IDENTITY into random Options, or re-expand the Equipment list into repeated long cards.
