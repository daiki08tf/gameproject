# World 4.0 — W30-W32

## W30 — Equipment Expansion II: Endgame Horizontal Gear

Adventure 4.0 does not create another equipment inventory, rarity, currency, upgrade axis, drop multiplier, or Item Power formula.

`adventureWorld4HorizontalGear.js` is a read-only view over the existing `BOUNTY_UNIQUES`, Unique 2.0 identities, and endgame loot roles. It classifies existing conditional gear by the activities that already own it: Rift, Nemesis/EX, Machine World, Secret Realm and existing Abyss target farms.

The view cannot grant equipment or alter reward math.

## W31 — Event Content Pack II

Adds one authored scene for every existing World 3/4 Region (7 total), covering Ambient, Investigation, NPC, Mystery and Secret flavors.

Pack II reuses the W6 event selector/history and Adventure temporary flags. It alternates with Content Pack I by Adventure index, so new content expands rather than replaces the original pool. No new reward or event-progression authority is introduced.

## W32 — Exploration Chronicle & World Records

`adventure4WorldRecords()` derives records from existing authorities only:

- Discovery: `world2.discoveries`
- Region Boss: existing CHAPTERS/Stage clear state
- Nemesis: existing `bountyNemesis`
- Mystery / Secret: existing `world2.eventsSeen` plus authored event tags

The result is integrated as `worldRecords` inside the existing Settlement Chronicle exhibit list. There is no second Chronicle screen, Codex denominator, record currency, completion reward, or persistent World 4 record root.

## Safety contracts

- BattleEngine unchanged.
- Endgame reward multipliers unchanged and never re-applied.
- No Adventure Lv / Exploration XP / World Token / daily timer.
- No new save root for W30 or W32.
- Existing Content Pack I remains reachable.
- Existing Story/Region/World Tier authorities remain canonical.
