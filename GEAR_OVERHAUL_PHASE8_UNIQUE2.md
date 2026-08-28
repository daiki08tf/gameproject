# Gear Overhaul Phase 8 — Unique 2.0

Status: **8A audit ✅ / 8B identity library ✅ / 8C Named weapon coverage ✅ / NEXT: 8D balance & presentation**

## Goal

Make Named / Unique equipment change the combat loop while preserving the Gear Overhaul item contract:

```text
Unique base item
+ gameplay-changing FIXED identity
+ random Options (max 3)
```

The FIXED identity remains outside Option slots and Option Fusion.

## 8A — Existing inventory audit ✅

The project already has the correct foundation and reuses it:

- `js/data/uniqueEquipment.js` — Named / bounty / secret-route Unique definitions (`unique:true`, fixed `effects`).
- `js/data/equipmentFixedIdentity.js` — exposes Unique as `UNIQUE FIXED`, outside random Option slots and Option Fusion.
- `js/data/equipment3Legendary.js` — reusable Legendary Power effect vocabulary.
- `js/data/uniqueBranchEffects.js` — additional existing unique-branch behavior.
- Equipment / Option 4.0 remains the random-roll layer.

No second Unique inventory, rarity, currency, or save root is introduced.

The audit found that existing Named Unique content was concentrated in accessories, swords and shields, with only limited representation of the completed Phase 6 weapon identities.

## 8B — Identity library ✅

`js/data/unique2IdentityLibrary.js` provides authored FIXED-identity recipes for the existing eight mastery families.

Contract:

- 8 existing weapon families only,
- 2 gameplay-loop identities per family = **16 initial recipes**,
- existing live combat-effect vocabulary only,
- every recipe references existing Phase 6 build lanes,
- recipe data creates no drop, stat, currency, save root or hidden bonus by itself,
- FIXED identity consumes zero random Option slots and is not Option-Fusion material.

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

Existing Named weapons were reused first:

- 剣: `血牙グラム` → `u2_sword_firstblood`
- 杖: `星詠みの杖` → `u2_staff_stararm`

Six previously uncovered families receive one new Mythic Named weapon each:

| Family | Named Unique | FIXED identity |
|---|---|---|
| 斧 | 終王斧グリムヘッド | execution |
| 弓 | 残光弓アステリオン | crit follow-up |
| 短剣 | 葬毒刃ミアズマ | on-hit DoT |
| 拳具 | 連星拳アルカ | crit combo |
| 楽器 | 戦律器カデンツァ | action-diversity tempo |
| 錫杖 | 反照錫セラフィム | guard → offense |

This gives **Named Unique weapon coverage to all eight current weapon families** without adding a ninth mastery family.

### Duplicate chase contract

The new items deliberately reuse the existing weapon-instance pipeline:

1. `state.addItem()` allocates a new `baseItemId#seq` physical weapon instance per drop.
2. The existing Equipment 3.0 compatibility layer immediately normalizes newly generated weapon Options to the approved Option 4.0 rarity count; Mythic therefore has max 3 random Options.
3. `getItem(instanceId)` resolves back to the Named Unique template, so its FIXED effects and `unique2IdentityId` remain intact.
4. Existing saved legacy 4–5 Option weapons are not destructively trimmed.

Regression tests generate duplicate copies of all six new weapons and verify distinct instance IDs, max-three Options, and preserved FIXED identity.

### Distribution intentionally deferred

The six new definitions use `distributionPending:true`. They do not invent a new drop source, mode or currency. Phase 9 will place them into existing endgame activities so target farming has clear purposes.

## 8D — NEXT: balance / presentation

Close Unique 2.0 before distribution:

- regression-gate extra-hit / echo / DoT / execution / guard / Boss-specialization values,
- retain per-action and anti-chain limits on proc identities,
- expose the authored Unique identity name + gameplay loop through the existing compact Equipment detail,
- avoid a new Unique screen or Home button,
- confirm one Unique does not make one Phase 6 build lane mandatory.

## Balance rules

- Extra attacks / echoes retain per-action or anti-chain limits already supported by combat.
- Execution effects stay within the Phase 6D execution envelope.
- Boss specialization normally pays an opportunity cost or remains narrower than universal damage.
- A Unique must not make one Phase 6 build lane the only valid route for its family.
- Brute-force stat / Option investment remains a valid alternative.

## Phase 9 — after 8D

Distribute the chase gear through existing Abyss / Rift / Nemesis / Secret Realm / Deep Survey structures, with distinct farming purposes and no new currency.
