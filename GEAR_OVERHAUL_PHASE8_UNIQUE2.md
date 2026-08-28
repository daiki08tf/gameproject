# Gear Overhaul Phase 8 — Unique 2.0

Status: **8A audit ✅ / 8B identity library ✅ / 8C Named weapon coverage ✅ / 8D balance & presentation ✅ / Phase 8 COMPLETE**

## Goal

Make Named / Unique equipment change the combat loop while preserving the Gear Overhaul item contract:

```text
Unique base item
+ gameplay-changing FIXED identity
+ random Options (max 3)
```

The FIXED identity remains outside Option slots and Option Fusion.

## 8A — Existing inventory audit ✅

The project reuses the existing architecture:

- `js/data/uniqueEquipment.js` — Named / bounty / secret-route Unique templates and fixed effects.
- `js/data/equipmentFixedIdentity.js` — `UNIQUE FIXED`, outside Option slots and Option Fusion.
- `js/data/equipment3Legendary.js` — live Legendary Power / combat-effect vocabulary.
- `js/data/uniqueBranchEffects.js` — additional existing unique-branch behavior.
- Equipment / Option 4.0 remains the random-roll layer.

No second Unique inventory, rarity, currency, save root, screen, or Home button is introduced.

## 8B — Identity library ✅

`js/data/unique2IdentityLibrary.js` contains **16 authored FIXED-identity recipes**: two for each existing weapon family.

Each recipe:

- references one or more existing Phase 6 build lanes,
- uses live combat-effect vocabulary,
- creates no drop/stat/save data by itself,
- consumes zero random Option slots,
- is not Option-Fusion material.

| Family | Recipe directions |
|---|---|
| 剣 | guard/counter, high-HP tempo |
| 斧 | execution, Boss tradeoff |
| 杖 | spell echo, spell→attack hybrid |
| 弓 | crit follow-up, Boss precision |
| 短剣 | DoT application, execution |
| 拳具 | crit combo, action diversity |
| 楽器 | tempo diversity, kill sustain/resource |
| 錫杖 | guard sustain→offense, spell echo judgment |

## 8C — Named / Unique content pass ✅

Existing Named weapons reused first:

- 剣: `血牙グラム` → `u2_sword_firstblood`
- 杖: `星詠みの杖` → `u2_staff_stararm`

Six previously uncovered families gained one Mythic Named weapon each:

| Family | Named Unique | FIXED identity |
|---|---|---|
| 斧 | 終王斧グリムヘッド | execution |
| 弓 | 残光弓アステリオン | crit follow-up |
| 短剣 | 葬毒刃ミアズマ | on-hit DoT |
| 拳具 | 連星拳アルカ | crit combo |
| 楽器 | 戦律器カデンツァ | action-diversity tempo |
| 錫杖 | 反照錫セラフィム | guard → offense |

All eight current weapon families now have at least one Named Unique weapon with an explicit combat-loop identity.

### Duplicate chase contract

Regression verifies:

1. each drop becomes a distinct `baseItemId#seq` weapon instance,
2. newly generated Mythic Named weapons obey max-three random Options,
3. `getItem(instanceId)` preserves the Named Unique template / FIXED effects / identity mapping,
4. legacy saved 4–5 Option weapons are not destructively trimmed.

The six new definitions remain `distributionPending:true`; Phase 9 places them into existing endgame activities instead of inventing a new source or currency.

## 8D — balance / presentation ✅

### Balance gates

All 16 authored identity recipes are regression-gated by effect kind. Current envelopes include:

- Crit follow-up: chance ≤22%, power ≤0.62, per-action cap 1.
- Spell echo: chance ≤15%, spell-only.
- On-hit DoT: chance ≤20%, power ≤0.42, max stacks 4, per-action cap 1.
- Execution: bonus ≤30%, HP threshold ≤25%.
- Action diversity: bonus ≤22%, duration ≤3 turns.
- Guard counter ≤0.72; guard-next-attack ≤0.58.
- Boss specialization ≤30% and requires an explicit normal-enemy opportunity cost in the recipe library.
- Kill sustain/resource ≤4% each.

Any new Unique 2.0 effect kind must gain an explicit gate instead of silently bypassing the test.

### Existing compact detail upgraded

`fixedEquipmentIdentities()` now resolves `unique2IdentityId` and presents:

```text
UNIQUE FIXED
<fixed identity name>
<combat-loop explanation>
```

The equipment row already carries the item name, so the fixed-detail line no longer wastes space repeating it. Legacy Unique items without a Unique 2.0 mapping retain their existing name/lore presentation.

## Phase 8 result

Unique 2.0 is now content-ready:

- 8/8 weapon-family Named coverage,
- gameplay-changing FIXED identities,
- duplicate random-Option chase,
- max-three Option contract,
- explicit balance gates,
- compact readable presentation,
- no parallel progression system.

## NEXT — Phase 9 Loot distribution / endgame return

Distribute chase gear through existing Abyss / Rift / Nemesis / Secret Realm / Deep Survey structures with distinct farming purposes and no new currency.

Target loop:

`high difficulty → chase Named/Unique/Greater/high-Option gear → Option Fusion/build refinement → deeper difficulty`
