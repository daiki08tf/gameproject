# Blade Vale — Gear Overhaul Phase 5: Smart Loot 4.0

> Status: **ACTIVE / Phase 5C synergy filter decision**

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

- `optionQuery`
- `minOptionRarity`
- `minOptionLevel`
- legacy `affixQuery` migrates into `optionQuery` and remains mirrored for compatibility
- detailed IP / Greater / Legendary / Curse / Option conditions apply to all equipment slots
- `weaponType` remains weapon-only
- one Option row must satisfy query + rarity + Lv together
- compact controls live inside the existing expandable 詳細 panel
- player-facing legacy `Affix` search is hidden in favor of `Option検索`
- active Option conditions contribute to the existing `⚙ 詳細(n)` badge
- mobile layout stays compact

Regression coverage:
- `tests/gear-overhaul-phase5a-option-filters.test.js`
- `tests/gear-overhaul-phase5a-option-filter-ui.test.js`

## Phase 5B — Protection rules ✅ COMPLETE

Automatic protection is now explicit and compact:

- Legendary Power — default ON
- Curse — default ON
- Greater — default `2+`
- Ancient Option — default ON
- Option Lv80+ — default ON
- optional Option text match — default OFF / blank

Design decisions:

- Ancient and Lv80+ protection are independent toggles.
- `Rare–Mythic / Lv79以下` does **not** auto-lock from Fusion-material protection alone.
- no new currency or material inventory; unwanted gear remains the Fusion material.
- old `protectFusionMaterials=false` saves migrate to both split Option protections OFF.
- legacy auto-lock `affixQuery` migrates to `autoLock.optionQuery` while remaining mirrored for compatibility.
- existing optional IP protection remains available; Phase 5B does not remove old saves/features.
- player-facing protection wording now distinguishes `Legendary Power`, `Curse`, `Ancient Option`, and `Option Lv`.

Regression coverage:
- `tests/gear-overhaul-phase5b-protection.test.js`

## Phase 5C — Useful synergy filters 🔄 ACTIVE

Only add if farming behavior justifies them:

- 2+ desired Option families/categories
- useful compact build-tag combinations

Acceptance gate:
- must solve a real farming scan problem not already covered by Option search / rarity / Lv
- must fit the existing detailed panel without becoming a Boolean rule editor
- must not auto-hide ordinary Fusion material by default

If the gate is not met, skip directly to Phase 5D closeout.

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
