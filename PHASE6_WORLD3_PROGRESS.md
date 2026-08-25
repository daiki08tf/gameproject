# Phase 6 — World 3.0 Progress

## Completed
- Region hierarchy for chapters 1–20.
- Existing Key Dungeons moved under a unified **Discovered Branches** route.
- Existing Exploration / Secret Realm discoveries surfaced in the same route.
- Unlocked Secret Realms can be entered directly from the World branch screen.
- Rift Keys are surfaced as discovered branch inventory without replacing their existing runtime logic.
- Heaven / Underworld now appear as explicit World nodes: hidden -> omen -> OPEN, with opened nodes selectable from the World screen.
- The unknown modern/anomaly realm now escalates from unknown -> contact -> signal while remaining intentionally non-selectable.
- Random World Events now surface on the battle result screen with real choices.
- Event choices create persistent World discoveries/flags such as rescued traveler, hidden trail, shrine map, merchant contact, border rumor, rift attunement and ancient keyhole records.
- Persistent event discoveries are visible under **Discovered Branches -> 旅で得た縁と手掛かり**.
- Three event discoveries now become concrete playable branches through the existing secret-stage resolver:
  - `travelerBond` -> **旅人の依頼：忘れられた荷車** (Lv110)
  - `oldMap` -> **古地図の地下礼拝堂** (Lv165)
  - `beastTrail` -> **獣王の隠れ巣** (Lv240)
- These branches use existing enemy/equipment/stage-clear systems and can be replayed after first clear; no parallel quest framework was added.

## Existing systems intentionally reused
- `world2.js` / `world2Core.js`: realm visibility, key fragments, forging, key consumption, World Events and persistent event discoveries.
- `exploration1.js` / `exploration1Core.js`: discovery/clue/unlock state.
- `secretRealms.js`: Secret Realm and World-event branch stage resolution.
- `riftKeyCore.js`: Rift Key inventory/modifiers.

## Phase 6 next targets
1. Give Heaven / Underworld stronger destination identity after opening without creating duplicate progression systems.
2. Continue anomaly/modern-world breadcrumbs toward a later reveal without naming the destination too early.
3. Final World 3.0 integration audit and completion marker.

## Rule for Claude Code / Codex
Do not create parallel World/Key/Exploration/Event systems. Extend the existing World 2.0, Exploration, Secret Realm and Rift Key foundations through the World 3.0 hierarchy. Persistent World-event flags are the canonical hooks for later content.
