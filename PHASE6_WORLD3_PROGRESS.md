# Phase 6 — World 3.0 Progress

## Completed
- Region hierarchy for chapters 1–20.
- Current realm visibility surfaced in the World screen.
- Existing Key Dungeons moved under a unified **Discovered Branches** route.
- Existing Exploration / Secret Realm discoveries surfaced in the same route.
- Unlocked Secret Realms can be entered directly from the World branch screen.
- Rift Keys are surfaced as discovered branch inventory without replacing their existing runtime logic.

## Existing systems intentionally reused
- `world2.js` / `world2Core.js`: realm visibility, key fragments, forging and key consumption.
- `exploration1.js` / `exploration1Core.js`: discovery/clue/unlock state.
- `secretRealms.js`: Secret Realm stage construction.
- `riftKeyCore.js`: Rift Key inventory/modifiers.

## Phase 6 next targets
1. Bind Heaven / Underworld opening to explicit World nodes instead of status-only visibility.
2. Expand anomaly/modern-world breadcrumbs without revealing the mystery too early.
3. Improve random World Events so choices can unlock routes/NPCs/content rather than mostly small resources.
4. Final World 3.0 integration audit and completion marker.

## Rule for Claude Code / Codex
Do not create parallel World/Key/Exploration systems. Extend the existing World 2.0, Exploration, Secret Realm and Rift Key foundations through the World 3.0 hierarchy.
