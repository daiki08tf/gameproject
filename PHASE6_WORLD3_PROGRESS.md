# Phase 6 — World 3.0 Progress

## Completed
- Region hierarchy for chapters 1–20.
- Existing Key Dungeons moved under a unified **Discovered Branches** route.
- Existing Exploration / Secret Realm discoveries surfaced in the same route.
- Unlocked Secret Realms can be entered directly from the World branch screen.
- Rift Keys are surfaced as discovered branch inventory without replacing their existing runtime logic.
- Heaven / Underworld now appear as explicit World nodes: hidden -> omen -> OPEN, with opened nodes selectable from the World screen.
- The unknown modern/anomaly realm now escalates from unknown -> contact -> signal while remaining intentionally non-selectable.

## Existing systems intentionally reused
- `world2.js` / `world2Core.js`: realm visibility, key fragments, forging and key consumption.
- `exploration1.js` / `exploration1Core.js`: discovery/clue/unlock state.
- `secretRealms.js`: Secret Realm stage construction.
- `riftKeyCore.js`: Rift Key inventory/modifiers.

## Phase 6 next targets
1. Improve random World Events so choices can unlock routes/NPCs/content rather than mostly small resources.
2. Give Heaven / Underworld stronger destination identity after opening without creating duplicate progression systems.
3. Continue anomaly/modern-world breadcrumbs toward a later reveal without naming the destination too early.
4. Final World 3.0 integration audit and completion marker.

## Rule for Claude Code / Codex
Do not create parallel World/Key/Exploration systems. Extend the existing World 2.0, Exploration, Secret Realm and Rift Key foundations through the World 3.0 hierarchy.
