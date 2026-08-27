# Blade Vale — Gear Overhaul Roadmap

> Status: **Phase 5 Smart Loot 4.0 COMPLETE — starting Phase 6 Weapon Identity**
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
- system inventory / Option audit / weapon-job audit complete

### Phase 1 — Option 4.0 ✅
- max 3 Options
- seven rarity identities
- stable `familyId / rarity / level / xp`
- rarity-name ladders + Lv1–100 curves
- old saves preserved

Key PRs: #229 / #230 / #231 / #234.

### Phase 2 — Option Fusion ✅
- same-family equipment-as-material Fusion
- rarity-gap efficiency
- Lv25/50/75/100 milestones
- low-rarity materials remain useful
- protection for locked/favorite/equipped/same-item

Key PRs: #235 / #236 / #237.

### Phase 3 — Existing-system consolidation ✅
- Temper retired for Option4
- Greater remains drop-only
- reroll = family replacement / Lv1 restart
- Unique / Legendary Power / Curse separated as FIXED IDENTITY
- Blacksmith UI cleaned

Key PRs: #238 / #239 / #240 / #241.

### Phase 4 — Equipment UI 3.x ✅
- compact item list + selected detail
- FIXED IDENTITY separated from Options
- Option Lv / EXP / MASTER visible
- job compatibility / build tags / compare
- detail actions relay existing safe logic
- compact 3×2 slot navigation and horizontal filter strip

Key PRs: #242 / #243 / #244 / #245.

## Phase 5 — Smart Loot 4.0 ✅ COMPLETE

### Phase 5A — All-slot Option filters ✅

- `optionQuery`
- minimum Option rarity
- minimum Option Lv
- one Option must satisfy query + rarity + Lv together
- all-slot filtering for weapon / shield / head / body / accessory
- weapon family remains weapon-only
- legacy `affixQuery` migrates into `optionQuery`
- compact controls live inside existing expandable 詳細 panel
- player-facing legacy `Affix` search is hidden in favor of `Option検索`
- active Option conditions contribute to `⚙ 詳細(n)`
- no new screen / route / save root

Key PR: #246.

### Phase 5B — Protection rules ✅

Automatic protection is deliberately narrow:

- Legendary Power: default ON
- Curse: default ON
- Greater: default 2+
- Ancient Option: default ON
- Option Lv80+: default ON
- optional Option text match: default OFF

Ancient and Lv80+ are independently toggleable. Ordinary `Rare–Mythic / Lv79以下` material remains feedable. Legacy `protectFusionMaterials=false` disables both split Fusion-material protections after migration.

Full handoff: `GEAR_OVERHAUL_PHASE5_SMART_LOOT.md`.

### Phase 5C — Useful synergy filters ⛔ SKIPPED (gate not met)

Decision: do not build 2+ desired Option family / build-tag combination filtering.

Reasoning:
- Phase 5A's single-Option `optionQuery + minOptionRarity + minOptionLevel` already lets a player scan for "one Option that satisfies query, rarity, and Lv together" per slot. A player who wants two specific families can already run the scan twice (there is no long farming session where doing so is impractical, since Equipment's list is already compact per Phase 4).
- No farming/scan problem was identified that Option search / rarity / Lv leaves unsolved. The acceptance gate ("must solve a real farming scan problem not already covered by Option search / rarity / Lv") is not met.
- A 2+ family combination filter would need either a second query row or a Boolean editor, which the roadmap explicitly rules out ("Do not build a giant Boolean filter editor").

Per this doc's own escape hatch ("If the gate is not met, skip directly to 5D"), Phase 5C did not add new UI or filter fields.

### Phase 5D — Closeout ✅

- removed the legacy visible Affix search field from `equipment.js` at the source (was hidden at runtime via `hideLegacyVisibleAffixField`; Option検索 already covers the same query)
- removed the legacy Legendary / Curse / Greater / Affix auto-lock fields from `equipment.js` at the source (were hidden at runtime via `hideLegacyProtectionFields`; the Phase 5B PROTECT panel already replaces all four, plus Ancient/Lv80+/Option-match)
- deleted both now-unused runtime hide functions from `smartLoot4EquipmentUi.js`
- `state.data.lootFilter3` migration (`affixQuery`→`optionQuery`, `protectFusionMaterials`→split flags) is untouched — old saves still normalize correctly
- regression coverage: `tests/gear-overhaul-phase5d-closeout.test.js` (removed-field assertions + old-save migration smoke test)
- Temper retirement was already handled in Phase 3 (`gearOverhaulCraftingConsolidation.js`); out of Phase 5 scope, left untouched
- `js/screens/status.js`'s stat-breakdown `Affix` label (an internal accounting category distinct from the loot-filter search field) was deliberately left as-is — renaming it is a broader terminology decision outside Phase 5's loot-filter scope

Advancing to Phase 6 Weapon Identity.

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

Merged through #247:
- #229–#231 Option foundation
- #234 Phase 1 closeout
- #235–#237 Option Fusion
- #238–#241 consolidation / Fixed Identity / Blacksmith cleanup
- #242–#245 Equipment UI 3.x
- #246 Phase 5A all-slot Option filters
- #247 Phase 5B protection rules (squash merge SHA `50e217b`)

Phase 5 Smart Loot 4.0 is now COMPLETE (this checkpoint, on top of #247):
- Phase 5C: evaluated and skipped — acceptance gate not met, reasoning recorded above
- Phase 5D: legacy Affix-labeled fields removed from `equipment.js` at the source (no more runtime hide patch), regression coverage added, old-save migration reconfirmed
- 818/818 tests green

Next: Phase 6 — strengthen the existing 8 weapon types / 24 sub-archetypes and their job coverage. Do not add new weapon types yet.

## AI handoff

Read before continuing:

1. `ROADMAP.md`
2. `GEAR_OVERHAUL_ROADMAP.md`
3. `GEAR_OVERHAUL_PHASE5_SMART_LOOT.md`
4. `GEAR_OVERHAUL_AUDIT.md`
5. `GEAR_OVERHAUL_OPTION_CATALOG.md`
6. `GEAR_OVERHAUL_WEAPON_JOB_AUDIT.md`
7. `GEAR_OVERHAUL_PHASE2_FUSION.md`
8. `GEAR_OVERHAUL_PHASE4_UI.md`
9. `js/data/equipment3SmartLoot.js`
10. `js/patches/equipment3SmartLoot.js`
11. `js/patches/smartLoot4EquipmentUi.js`
12. `js/screens/equipmentFusion.js`
13. `js/screens/equipment4.js`

Do not silently return to 5 random Affixes, remove the brute-force route, add a new currency, auto-promote Option rarity by leveling, restore numeric Temper on Option4, make Greater freely craftable, let reroll inherit old Option Lv/EXP, mix FIXED IDENTITY into random Options, or re-expand the Equipment list into repeated long cards.
