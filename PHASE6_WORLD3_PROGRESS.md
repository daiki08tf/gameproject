# Phase 6 — World 3.0 COMPLETE

World 3.0 is complete. Future world content should expand this hierarchy instead of adding parallel world/menu systems.

## Completed
- Region hierarchy for chapters 1–20.
- World layer nodes for Mortal / Heaven / Underworld / unknown anomaly realm.
- Heaven / Underworld lifecycle: hidden -> omen -> OPEN -> selectable route.
- Heaven identity: **聖域探索** — Relic, light-element gear and high-tier material hunting.
- Underworld identity: **高危険探索** — recovery pressure, Unique gear and dark/fire build hunting.
- Unknown realm breadcrumb lifecycle: unknown -> CONTACT -> SIGNAL -> TRACE while keeping the destination name unrevealed and non-selectable.
- Existing Key Dungeons unified under **Discovered Branches**.
- Existing Exploration / Secret Realm discoveries unified under the same route.
- Rift Keys surfaced as World discoveries without replacing their runtime logic.
- Random World Events surface on battle results with real choices.
- Event outcomes persist as canonical World discovery flags.
- Persistent discoveries are visible under **Discovered Branches -> 旅で得た縁と手掛かり**.
- Three event discoveries are already playable hidden routes:
  - `travelerBond` -> **旅人の依頼：忘れられた荷車** (Lv110)
  - `oldMap` -> **古地図の地下礼拝堂** (Lv165)
  - `beastTrail` -> **獣王の隠れ巣** (Lv240)

## Canonical World 3.0 hierarchy

WORLD
- Realm nodes
  - 人界
  - 天界
  - 冥界
  - ？？？
- Regions
  - chapters / lands
    - stages
- Discovered Branches
  - Key Dungeons
  - World Event clues and hidden routes
  - Secret Realms
  - Rift Keys

## Existing systems intentionally reused
- `world2.js` / `world2Core.js`: realm visibility, keys, World Events, persistent discovery flags and anomaly progression.
- `world2Stages.js`: Key Dungeon combat stages and destination identities.
- `exploration1.js` / `exploration1Core.js`: discovery/clue/unlock state.
- `secretRealms.js`: Secret Realm and World-event hidden-stage resolution.
- `riftKeyCore.js`: Rift Key inventory/modifiers.
- normal stage clear / equipment / enemy systems for playable World branches.

## Completion rule
World 3.0 is considered complete because the World screen is no longer only a flat chapter list: realm state, region progression, hidden routes, keyed exploration, persistent event discoveries and mystery breadcrumbs all feed one navigation/progression structure.

## Rule for Claude Code / Codex
Do not create parallel World / Realm / Key / Exploration / Event / Quest frameworks for features that can fit this hierarchy. Extend the existing World 3.0 nodes, `Discovered Branches`, persistent World-event flags and secret-stage resolver. New content should answer at least one of these questions: where is it in the World hierarchy, what unlocks it, and which existing progression/reward system it feeds.
