# Blade Vale — Gear Overhaul Phase 4: Equipment UI 3.x

> Status: **ACTIVE / Phase 4C detail actions**

## Goal

Reorganize Equipment around a compact mobile-first hierarchy:

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
- The item list is for scanning/selection; long explanations belong in selected detail.
- Mobile-first: selected detail sits below the list; wide layouts may use list-left/detail-right.
- New detail actions must reuse existing state/safety logic rather than duplicate it.

## Phase 4A — Selected detail foundation ✅

Merged in PR #242.

- non-destructive presentation layer on top of the existing Equipment renderer
- item-row tap selects detail without stealing button clicks
- detail shows rarity / slot / IP / Greater / base stats / weapon type
- current-job weapon compatibility and compact build tags
- FIXED IDENTITY block
- max-three Option rows with rarity name / Lv / EXP / MASTER
- current-equipped base-stat delta
- mobile single-column and wide two-column layout

## Phase 4B — List compaction ✅

Merged in PR #243.

- full Option blocks, special prose and duplicate comparison prose removed from compact list rows
- list-level scan badges: IP / OP count / highest Option rarity / Greater / FIXED / lock / KEEP
- long names ellipsized
- normal stat prose hidden in list; disabled items keep a short lock reason
- favorite / lock controls collapsed to accessible icon-scale buttons
- Fusion action shortened to `OP育成`
- equip / unequip remains one tap

## Phase 4C — Detail actions 🔄

Current branch `gear-overhaul-phase4c-detail-actions`:

Selected detail footer exposes:

- equip / unequip
- KEEP favorite toggle
- lock / protection toggle
- OP育成 entry

Important implementation rule: **the detail footer does not call state mutation APIs directly**.

Instead it locates the already-authoritative selected list row and relays the click to its existing action button. Therefore:

- equip restrictions remain identical
- favorite / lock behavior remains identical
- Fusion material / protection rules remain identical
- existing rerender paths remain authoritative
- disabled state is mirrored into detail controls

Row actions remain available as fallback during Phase 4.

Sell/dispose is not invented here; it remains deferred until an existing safe disposal rule can be reused without bypassing lock/favorite/equipped protection.

## Phase 4D — Filters / polish

Next:

- compact category/filter bar
- reduce advanced-filter vertical footprint
- selected row/detail synchronization polish
- mobile overflow and long-name regression pass
- prepare Option-aware filtering handoff to Smart Loot 4.0

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
