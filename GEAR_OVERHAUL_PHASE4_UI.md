# Blade Vale — Gear Overhaul Phase 4: Equipment UI 3.x

> Status: **ACTIVE / Phase 4A selected-item detail**

## Goal

Reorganize Equipment around a compact mobile-first information hierarchy inspired by the previously discussed reference layout:

1. category / equipped-slot selection
2. compact item list
3. selected-item detail
4. nearby actions

Do not pixel-copy another game. Reuse the information architecture only.

## Permanent UI rules

- Do not add a new Home button or separate inventory route.
- Preserve the existing Equipment screen, filters, Smart Loot, equip actions, lock/favorite and inline Option Fusion.
- Random Options remain max 3.
- FIXED IDENTITY must never be visually mixed into the three random Option rows.
- Avoid returning to giant long-form item cards for every item in the list.
- Mobile-first: selected detail may sit below the list; wide layouts may use list-left/detail-right.

## Phase 4A — Selected detail foundation

Implemented on `gear-overhaul-phase4a-equipment-detail`:

- `js/screens/equipment4.js` adds a non-destructive presentation layer on top of the existing Equipment renderer.
- Existing row order/filter/equip/Fusion logic remains authoritative.
- Tapping a list row selects it for detail without stealing button clicks.
- Detail shows:
  - selected item name / rarity
  - equipment slot
  - Item Power / Greater count
  - base stats
  - weapon type
  - current-job weapon compatibility
  - compact build tags derived from Option categories
  - FIXED IDENTITY block
  - max-three Option rows
  - Option rarity-authored name
  - Option Lv / EXP / MASTER
  - current-equipped base-stat delta
- `css/equipment4.css` keeps mobile single-column and switches to a two-column list/detail layout on wider screens.
- The layer is loaded through the already-live Gear Overhaul compatibility patch so `main.js` does not need another screen route.

## Phase 4B — List compaction

Next:

- reduce each inventory list row to a compact scan line
- keep only the most important list-level signals: name / rarity / IP / Option quality summary / lock state
- move long descriptions, full Option text and build explanations into selected detail
- ensure very long weapon names do not create large row height
- preserve one-tap equip and material protection actions

## Phase 4C — Detail actions

Move the most common actions into the selected-detail footer without duplicating state logic:

- equip / unequip
- favorite
- lock
- Option Fusion entry
- sell / dispose only when safe and already supported by existing item rules

The existing row actions remain fallback until the detail actions are proven stable.

## Phase 4D — Filters / polish

- compact category/filter bar
- Option-aware sort/filter handoff toward Smart Loot 4.0
- selected row highlight
- sticky detail on wide layout
- test mobile overflow and long-name regressions

## Acceptance target

The player should be able to answer these without scrolling through several large cards:

- What item am I looking at?
- Is it stronger than what I have equipped?
- What is its fixed identity?
- What are its three Options and their levels?
- Does it fit my current job/build?
- Can I equip, protect or grow it from here?

## Handoff

Read together with:

- `GEAR_OVERHAUL_ROADMAP.md`
- `GEAR_OVERHAUL_PHASE2_FUSION.md`
- `js/data/equipmentFixedIdentity.js`
- `js/data/equipment3Presentation.js`
- `js/screens/equipmentFusion.js`
- `js/screens/equipment4.js`
- `css/equipment4.css`
