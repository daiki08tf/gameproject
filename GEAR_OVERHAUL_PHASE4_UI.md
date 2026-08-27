# Blade Vale — Gear Overhaul Phase 4: Equipment UI 3.x

> Status: **COMPLETE / Phase 4A–4D**

## Goal

Equipment is now organized around a compact mobile-first hierarchy:

1. compact equipment-slot/category selection
2. compact item list
3. selected-item detail
4. nearby actions

The reference layout was used only as information-architecture inspiration; Blade Vale keeps its own UI and existing Equipment route.

## Permanent UI rules

- no new Home button or separate inventory route
- preserve filters, Smart Loot, equip actions, lock/favorite and Option Fusion
- random Options remain max 3
- FIXED IDENTITY is visually separate from random Options
- list = scan/select; detail = read/compare/grow
- mobile first; wide layout may use list-left/detail-right
- detail actions reuse existing authoritative state/safety logic

## Phase 4A — Selected detail foundation ✅

Merged in PR #242.

- selected item detail without replacing the existing renderer
- rarity / slot / IP / Greater / base stats / weapon type
- current-job compatibility and build tags
- FIXED IDENTITY
- max-three Option rows with Lv / EXP / MASTER
- current-equipped base-stat delta
- mobile single-column / wide two-column layout

## Phase 4B — List compaction ✅

Merged in PR #243.

- removed repeated long Option/special/compare prose from list rows
- compact badges: IP / OP count / highest rarity / Greater / FIXED / lock / KEEP
- long-name ellipsis
- compact favorite / lock / OP育成 actions
- disabled gear retains only a short lock reason

## Phase 4C — Detail actions ✅

Merged in PR #244.

Selected detail footer exposes:

- equip / unequip
- KEEP favorite
- lock / protection
- OP育成

These controls relay to the existing list-row actions instead of directly mutating state, preserving the original equip restrictions, protection rules, Fusion safety and rerender behavior.

Sell/dispose remains intentionally outside this detail footer until a safe existing disposal path is deliberately reused.

## Phase 4D — Navigation / mobile polish ✅

Current closeout branch:

- six equipped slots become a compact 3×2 category grid
- long equipped names are ellipsized
- normal loot filters remain one horizontal scroll strip
- advanced filters use vertical space only when explicitly opened
- Equipment header controls are reduced for narrow screens
- list/detail content gets more viewport space
- regression coverage protects compact slot/filter behavior

After green CI + merge, Phase 4 is complete and **Phase 5 Smart Loot 4.0 becomes active**.

## Acceptance result

The Equipment screen now makes these answers available without several giant repeated item cards:

- what item is selected
- whether it improves current equipment
- which effects are FIXED IDENTITY
- what the three Options are and how far they are trained
- whether the weapon fits the current job/build
- whether the item can be equipped, protected or grown

## Next — Phase 5 Smart Loot 4.0

Add player-facing Option-aware search/filtering without turning the Equipment screen back into a giant form:

- Option family
- minimum Option rarity
- minimum Option Lv
- useful combination/synergy filters only where they reduce farming burden
- preserve Ancient / Lv80+ material protection
- expand all-slot behavior consistently

## Handoff

Read together with:

- `GEAR_OVERHAUL_ROADMAP.md`
- `GEAR_OVERHAUL_PHASE2_FUSION.md`
- `js/data/equipmentFixedIdentity.js`
- `js/data/equipment3Presentation.js`
- `js/screens/equipmentFusion.js`
- `js/screens/equipment4.js`
- `css/equipment4.css`
