# Phase 10.4 — Endgame Progression Guidance / Integrity

## Goal

Make the late game answer one question clearly: **what should I play next?**

Phase 10.4 does not add another progression multiplier. It exposes the progression contract already established by World Tier, Abyss, Nemesis and Phase 10.3 reward scaling.

## Player-facing guidance

The home screen gets one compact `NEXT` card directly below the primary Adventure action.

The recommendation is derived from:

- Character level
- Current World Tier
- Abyss unlock state
- Best Abyss depth
- Active Nemesis pressure

The card routes to existing screens rather than adding another navigation layer.

## Progression lanes

| Character Lv | Primary lane |
| ---: | --- |
| 1–2,999 | Story / regional exploration |
| 3,000–9,998 | World Tier + Abyss entry |
| 9,999–29,998 | Abyss + EX Bounty |
| 29,999–49,998 | Mid Abyss + Machine World |
| 49,999–74,998 | Deep Abyss + Nemesis |
| 74,999–99,998 | Boundary Zero + deepest progression |
| 99,999 | Limit band / target farming |

If Abyss is still locked, the recommendation remains story-first regardless of level so the UI never sends the player to a locked destination.

## Abyss contract

Phase 10.4 treats **3000F** as the canonical roadmap cap because the existing Abyss endgame table maps 3000F to Lv99,999. Recommendations never exceed this depth.

## Reward integrity

The card reads the shared Phase 10.3 reward profile. It does not maintain a second loot table or reward curve.

At Lv99,999 the displayed shared baseline remains:

- Drop ×2.8
- Gold ×4.25
- Item Power +1250

## Guardrails

The Phase 10.4 test suite locks:

- level-lane boundary coverage through Lv99,999
- monotonic Abyss recommendation depth and 3000F ceiling
- World Tier recommendation alignment
- shared Phase 10.3 reward profile usage
- locked-Abyss story fallback
- Nemesis recommendation priority when World Tier is current
- UI Foundation home wiring and compact card contract
