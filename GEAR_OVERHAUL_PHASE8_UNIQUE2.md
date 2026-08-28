# Gear Overhaul Phase 8 — Unique 2.0

Status: **8A audit ✅ / 8B identity library ACTIVE**

## Goal

Make Named / Unique equipment change the combat loop while preserving the Gear Overhaul item contract:

```text
Unique base item
+ gameplay-changing FIXED identity
+ random Options (max 3)
```

The FIXED identity remains outside Option slots and Option Fusion.

## 8A — Existing inventory audit ✅

### Existing architecture

The project already has the correct foundation and must reuse it:

- `js/data/uniqueEquipment.js` — Named / bounty / secret-route Unique definitions (`unique:true`, fixed `effects`).
- `js/data/equipmentFixedIdentity.js` — exposes Unique as `UNIQUE FIXED`, explicitly outside random Option slots and Option Fusion.
- `js/data/equipment3Legendary.js` — reusable Legendary Power effect vocabulary and runtime-supported combat patterns.
- `js/data/uniqueBranchEffects.js` — additional existing unique-branch behavior.
- Equipment/Option 4.0 remains the random-roll layer.

**Do not create a second Unique inventory, new rarity, new currency, or new save root.**

### Coverage findings

Current Named Unique content is heavily concentrated in:

- accessories,
- swords,
- shields,
- broad effects such as Boss damage / action diversity / flat damage bonus.

Only a small portion currently expresses the completed Phase 6 identities of all eight weapon families. This is the main Phase 8 content gap.

### Identity quality findings

Keep and deepen identities that change decisions, including:

- guard → attack/counter,
- spell → stored/echoed offense,
- high-HP aggression with a tradeoff,
- Boss specialization with a tradeoff,
- action-diversity tempo.

Upgrade or avoid repeating identities whose practical result is primarily another unconditional numeric multiplier.

## 8B — Identity library 🔄

`js/data/unique2IdentityLibrary.js` is the authored recipe layer for Phase 8C.

Initial contract:

- existing **8** mastery families only,
- at least **2 distinct identity recipes per family**,
- recipes use combat effect kinds already present in the live Unique / Legendary systems,
- every recipe points to one or more existing Phase 6 build lanes,
- recipes add no stats or damage until bound to an actual item,
- FIXED identity never consumes a random Option slot,
- no hidden new progression system.

Initial library: **16 weapon identity recipes**.

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

These are reusable recipes, **not 16 newly injected drops**. Phase 8C decides which weak existing Uniques are upgraded first and where genuinely new Named items are justified.

## Phase 8C — next

1. Score existing Uniques by gameplay identity strength and family/slot coverage.
2. Upgrade weak existing Unique weapons before adding replacements.
3. Add Named/Unique weapons only for families with no credible existing representation.
4. Bind each upgraded/new item to a Unique 2.0 recipe or an equally explicit fixed identity.
5. Preserve max-3 random Options on generated instances.
6. Keep duplicate drops desirable through differing random Options / Option rarity / Option Lv.

## Balance rules

- Extra attacks / echoes must retain per-action or anti-chain limits already supported by combat.
- Execution effects must stay within the Phase 6D execution envelope.
- Boss specialization should normally pay an opportunity cost or remain narrower than universal damage.
- A Unique must not make one Phase 6 build lane the only valid route for its family.
- Brute-force stat/Option investment remains a valid alternative.

## Phase 8D — later

After the content pass:

- duplicate-chase verification,
- runaway proc/echo checks,
- concise existing Equipment-detail presentation,
- loot-source distribution into existing endgame activities.
