# Gear Overhaul Phase 2 — Option Fusion

> Status: Phase 2A ✅ / Phase 2B ✅ / Phase 2C implementation

## Purpose

Option Fusion is the deterministic progression half of Blade Vale's loot loop.

A jackpot drop is luck. Option Fusion guarantees that repeated farming still moves a chosen build forward.

> **「知らん、火力と耐久で押し切る」** is a supported route: a player may compensate for imperfect build answers by pushing important Options toward Lv80–100.

## Permanent rules

- equipment itself is the material; no new currency
- target and material must share the same canonical `familyId`
- legacy alias IDs may feed the canonical family
- Option rarity never increases from Fusion
- Option Lv caps at 100
- locked / favorite / equipped / same-item material cannot be consumed
- unrelated Options on the consumed material are lost
- low-rarity same-family material always grants positive EXP

## Material efficiency

| Material rarity relative to target | Efficiency |
|---|---:|
| same or higher | 100% |
| -1 | 80% |
| -2 | 60% |
| -3 | 40% |
| -4 or worse | 20% |

Phase 2C base EXP per material Option:

| Rarity | Base EXP |
|---|---:|
| Common | 36 |
| Uncommon | 48 |
| Rare | 68 |
| Epic | 96 |
| Legendary | 136 |
| Mythic | 190 |
| Ancient | 270 |

Material Option Lv multiplies this gradually from x1.00 at Lv1 toward roughly x1.99 at Lv100 before rarity-gap efficiency.

## Lv1–100 curve

`optionXpToNext(level)` remains intentionally nonlinear. Total EXP from Lv1 to Lv100 is about **62k**.

The Phase 2C decision is to raise material EXP rather than flatten the level curve. This preserves the feeling that Lv80–100 is true mastery while avoiding thousands of same-rarity chase drops for one family.

Representative same-family Lv50 material counts from Lv1 to Lv100 are roughly:

- Rare material into Rare target: ~600
- Legendary into Legendary: ~300
- Ancient into Ancient: ~155

These are reference figures, not guarantees. Real targets usually drop above Lv1, and mixed-rarity material changes the count.

## Milestones

Option progression has four visible checkpoints:

- Lv25 — first mastery checkpoint
- Lv50 — committed build checkpoint
- Lv75 — endgame mastery checkpoint
- Lv100 — **MASTER**

Fusion preview reports milestone crossings. The Equipment UI shows the next milestone and celebrates crossings after a Fusion.

Milestones are feedback and small existing value-curve bonuses; they must not become mandatory hard gates.

## Smart Loot integration

High-value Fusion material is protected by Smart Loot by default:

- any Ancient Option, or
- any Option Lv80+

This protection applies to weapon, armor and accessory instances.

Ordinary Rare/Epic mid-level materials remain unprotected so the player can continuously feed them without inventory paralysis. Protected material can still be deliberately unlocked by the player.

## UI contract

Fusion stays inside the existing Equipment screen.

`OPTION育成` shows:

- target Option name / rarity / Lv
- current EXP / next-level EXP
- reached mastery checkpoint
- next checkpoint and approximate remaining EXP
- top 8 matching material candidates by useful EXP
- material rarity / Lv / EXP / efficiency
- milestone crossing preview
- destructive-use confirmation

No new Home button, parallel inventory, or Fusion-only currency.

## Implementation map

- `js/data/options4.js` — Option identities, rarity names, value curves
- `js/data/options4Fusion.js` — EXP curve, material EXP, milestones
- `js/patches/options4Fusion.js` — inventory/runtime consumption
- `js/screens/equipmentFusion.js` — inline Fusion UI
- `js/data/equipment3SmartLoot.js` — valuable material protection
- `tests/options4-fusion.test.js` — core/runtime regression
- `tests/options4-fusion-ui.test.js` — UI integration regression
- `tests/options4-fusion-tuning.test.js` — Phase 2C tuning contract

## Next after Phase 2

Phase 3 audits overlap with Greater / Temper / random roll width / reroll. The rule is **simplify existing axes before adding more power systems**.
