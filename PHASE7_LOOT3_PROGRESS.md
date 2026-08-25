# Phase 7 — Loot 3.0 Progress

Status: IN PROGRESS

## Goal
Make every meaningful drop answer three questions immediately:
1. Is this item exciting?
2. Why is it exciting?
3. What build or destination should I chase next?

Loot 3.0 extends the existing equipment, weapon-instance, Affix, Unique, Set, Codex, enhancement and World 3.0 systems. It must not create a parallel inventory or equipment framework.

## Existing foundations already present
- Equipment rarity: normal / rare / epic / legendary / mythic.
- Weapon instances: each dropped weapon can keep its own persistent random Affixes.
- 77 weapon Affixes across seven Affix rarity tiers through ancient.
- Weapon-type Affix bias and high-tier Build Affixes.
- Existing Unique, Set, Codex, Boss weapon, enhancement and awakened-item systems.
- World 3.0 destination tags and drop multipliers for targeted exploration.

## Phase 7 roadmap
### 7.1 Loot identity and quality model
- [ ] Add one canonical loot-quality summary for a dropped/equipped item.
- [ ] Distinguish base item rarity from Affix quality instead of conflating them.
- [ ] Surface notable rolls: high Affix tier, Build Affix, Unique/Set identity, target-farm relevance.
- [ ] Keep old saves and non-instance equipment compatible.

### 7.2 Drop excitement
- [ ] Improve battle-result loot presentation for genuinely notable drops.
- [ ] Add concise reasons such as `ANCIENT AFFIX`, `BUILD`, `UNIQUE`, `SET`, `NEW CODEX`.
- [ ] Avoid making every legendary-looking item feel equally special.

### 7.3 Target farming
- [ ] Connect World 3.0 destinations to explicit loot families.
- [ ] Heaven: Relic / light-build / high-tier material identity.
- [ ] Underworld: Unique / dark-fire / high-risk identity.
- [ ] Abyss routes and bosses: depth/build/boss-oriented quality pressure.
- [ ] Keep the unknown anomaly route primarily informational until Story resolves it.

### 7.4 Inventory decisions
- [ ] Make compare / keep / lock / favorite / dismantle decisions readable.
- [ ] Preserve weapon instance Affixes when moving equipment in/out of inventory.
- [ ] Ensure auto-equip and power-score logic do not silently destroy build-specialized value.

### 7.5 Endgame chase
- [ ] Define chase tiers without adding an unnecessary new base rarity above Mythic.
- [ ] Ancient remains an Affix tier, not a duplicate equipment rarity.
- [ ] Use combinations of item identity + Affix quality + build synergy for jackpot drops.

### 7.6 Integration audit and COMPLETE marker
- [ ] Regression tests for instance persistence, quality classification and old-save compatibility.
- [ ] Confirm Battle 3.0 / World 3.0 / Loot 3.0 reward loops connect cleanly.
- [ ] Add `PHASE7_LOOT3_COMPLETE.md` only after the player-facing loop is complete.

## Guardrails for Claude Code / Codex
- Do not add another inventory/equipment/rarity framework.
- Do not turn Affix rarity into a second base-item rarity system.
- Do not remove existing weapon instance IDs; they are the canonical persistence mechanism for random weapon rolls.
- Do not make raw power score the only definition of a good item; Build Affixes and special effects can be valuable without the highest flat stats.
- Prefer extending `equipment.js`, `affixes.js`, `state.js`, existing loot/drop resolution and existing UI.
