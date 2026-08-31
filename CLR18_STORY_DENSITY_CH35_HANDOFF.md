# CLR-18 — Story Density Migration / Late-game representative slice

Status: IMPLEMENTED IN THIS BRANCH

## Representative Chapter

Chapter 35 — `共観測点`

Why this Chapter:

- late Story expansion layer,
- canonical expanded 8-Stage spine,
- existing midboss and boss anchors,
- existing lore already contains the late-game `第八鍵` / shared observation / dual-outline material,
- canon explicitly leaves the cause and meaning unresolved.

## Player-facing cadence

For canonical main Stages `35-1` through `35-8`:

```text
Stage detail
→ canonical battle
→ first victory
→ normal Result / EXP / Loot
→ concise 「戦いの跡」
→ next Stage / Stage list
```

Replay, defeat, retreat and `35-B` do not show the CLR-18 beat.

## Story progression

The beats only expose fragments after combat and build through:

1. two independent observations point to the same anomaly,
2. the Eighth Key briefly stabilizes as a shared reference,
3. abnormal records align,
4. synchronization breaks around differing outlines,
5. two states occupy the same coordinate,
6. the Deep Green Forest coordinate presents the giant-canopy / no-forest-reaction dual outline,
7. both outlines remain visible at the shared focus,
8. defeating the boss does not explain the phenomenon.

The final beat intentionally preserves the canonical statement that the cause and meaning are still unexplained.

## Authority boundaries

No new:

- Story progression root,
- Stage-clear flag,
- save root,
- BattleEngine authority,
- EXP / Gold authority,
- drop / rarity / Item Power authority,
- unlock requirement.

Existing `stageProgress` / `state.isStageCleared()` remains authoritative.

## CLR-18 representative coverage after this slice

- early game: Chapter 1
- mid game: Chapter 18
- late game: Chapter 35

If these three slices remain sound in playtest, the next CLR-18 step is bulk migration of remaining Chapters in bounded batches, using the same first-clear post-combat contract and preserving canonical Stage IDs and existing lore.
