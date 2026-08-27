# Blade Vale — Gear Overhaul Phase 5: Smart Loot 4.0

> Status: **ACTIVE / Phase 5B protection rules**

## Goal

Make long farming sessions manageable without hiding valuable Fusion material and without rebuilding Equipment into a giant filter form.

## Permanent rules

- no new screen, Home button, currency, save root or daily/weekly loop
- preserve old `lootFilter` saves through normalization
- all-slot behavior: weapon / shield / head / body / accessory
- weapon-family filtering remains meaningful only for weapons
- Option filters evaluate one Option row as a unit: query + rarity + Lv must be satisfied by the same Option
- Ancient / Lv80+ Fusion material protection remains active by default
- ordinary mid-tier material must stay feedable

## Phase 5A — All-slot Option filters ✅ COMPLETE

Implemented on `gear-overhaul-phase5a-option-filters`:

- `optionQuery`
- `minOptionRarity`
- `minOptionLevel`
- legacy `affixQuery` migrates into `optionQuery` and remains mirrored for compatibility
- detailed IP / Greater / Legendary / Curse / Option conditions now apply to all equipment slots
- `weaponType` remains weapon-only
- one Option row must satisfy query + rarity + Lv together
- compact controls are injected into the existing expandable 詳細 panel
- player-facing legacy `Affix` search is hidden in favor of `Option検索`
- active Option conditions contribute to the existing `⚙ 詳細(n)` badge
- mobile layout keeps Option controls compact
- no new route or screen

Default values preserve old behavior:

```text
optionQuery = ""
minOptionRarity = any
minOptionLevel = 0
```

Regression coverage:

- `tests/gear-overhaul-phase5a-option-filters.test.js`
- `tests/gear-overhaul-phase5a-option-filter-ui.test.js`

## Phase 5B — Protection rules 🔄 NEXT

Audit automatic protection wording and controls around:

- Legendary Power
- Curse
- Greater threshold
- Ancient Option
- Option Lv80+
- optional Option text rule

Protection should prevent accidental destruction, not hoard every useful material automatically.

## Phase 5C — Useful synergy filters

Only if farming tests justify them:

- 2+ desired Option families/categories
- useful build-tag combinations

Avoid a giant Boolean rule builder.

## Phase 5D — Closeout

- remaining player-facing `Affix` wording cleanup
- all-slot tests
- mobile filter footprint
- migration tests
- then advance to Phase 6 Weapon Identity

## Handoff files

- `GEAR_OVERHAUL_ROADMAP.md`
- `GEAR_OVERHAUL_PHASE4_UI.md`
- `js/data/equipment3SmartLoot.js`
- `js/patches/equipment3SmartLoot.js`
- `js/patches/smartLoot4EquipmentUi.js`
- `js/screens/equipment.js`
- `js/screens/equipmentFusion.js`
- `css/equipment4.css`
