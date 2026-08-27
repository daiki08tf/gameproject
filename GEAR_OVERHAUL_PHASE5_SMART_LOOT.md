# Blade Vale — Gear Overhaul Phase 5: Smart Loot 4.0

> Status: **ACTIVE / Phase 5A all-slot Option filter core**

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

## Phase 5A — All-slot Option filters

Current branch `gear-overhaul-phase5a-option-filters` adds the data contract:

- `optionQuery`
- `minOptionRarity`
- `minOptionLevel`
- legacy `affixQuery` migrates into `optionQuery` and remains mirrored for compatibility
- detailed IP / Greater / Legendary / Curse / Option conditions now apply to all equipment slots
- `weaponType` remains weapon-only

Default values intentionally preserve old behavior:

```text
optionQuery = ""
minOptionRarity = any
minOptionLevel = 0
```

Regression coverage verifies armor/accessory filtering and same-Option matching semantics.

### Phase 5A2 — Compact filter controls

Next UI slice:

- rename player-facing `Affix` search to `Option`
- expose Option search, minimum rarity and minimum Lv inside the existing expandable 詳細 panel
- keep normal filter strip compact
- count active Option filters in the existing 詳細 badge

Do not add another top-level filter panel.

## Phase 5B — Protection rules

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

- player-facing `Affix` wording cleanup
- all-slot tests
- mobile filter footprint
- migration tests
- then advance to Phase 6 Weapon Identity

## Handoff files

- `GEAR_OVERHAUL_ROADMAP.md`
- `GEAR_OVERHAUL_PHASE4_UI.md`
- `js/data/equipment3SmartLoot.js`
- `js/patches/equipment3SmartLoot.js`
- `js/screens/equipment.js`
- `css/equipment4.css`
