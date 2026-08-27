# Blade Vale — Gear Overhaul Phase 4: Equipment UI 3.x

> Status: **ACTIVE / Phase 4B compact list**

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

## Phase 4B — List compaction 🔄

Current branch `gear-overhaul-phase4b-list-compaction`:

- hide list-level full Affix/Option blocks, special lines and duplicate comparison prose
- keep long information in selected detail
- each list row gets compact scan badges:
  - IP
  - OP count
  - highest Option rarity
  - Greater count
  - FIXED count
  - lock / KEEP state
- long names use ellipsis instead of increasing row height
- normal stat prose is hidden in list rows; disabled items keep a short lock reason
- favorite / lock controls collapse to icon-scale buttons with accessible labels
- inline Fusion action shortens to `OP育成`
- equip / unequip remains one tap

## Phase 4C — Detail actions

Next:

Move the most common actions into selected-detail footer without duplicating state rules:

- equip / unequip
- favorite
- lock
- Option Fusion entry
- sell / dispose only when safe and already supported by existing item rules

Keep row actions as fallback until detail actions are proven stable.

## Phase 4D — Filters / polish

- compact category/filter bar
- Option-aware sort/filter handoff toward Smart Loot 4.0
- mobile overflow and long-name regression pass
- selected row/detail synchronization polish

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
