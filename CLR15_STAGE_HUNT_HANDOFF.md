# CLR-15 — Stage-first Hunt handoff

## Status

Implemented on top of CLR-13/14 Stage-first navigation.

## Player path

```text
Home
→ 冒険
→ Chapter
→ cleared Stage
→ Stage detail
→ Hunt / <Region>を周回
→ existing Adventure4 free-adventure route
→ repeated battles / aftermath / Elite-Boss / safe return
```

## Unlock contract

Hunt is shown only when:

- the selected canonical Stage is cleared,
- the Stage is an ordinary Story Stage (not branch/bounty),
- the owning World 4.0 Region is fully Story-completed according to existing `world4RegionState`.

No new Hunt progression, currency, stamina, XP, inventory or save root is introduced.

## Authorities reused

- Stage identity/progression: `CHAPTERS` + `state.isStageCleared`
- Stage → Region grouping: `buildWorld4RegionCatalog`
- Region completion: `world4RegionState`
- Adventure persistence: `state.data.adventure4`
- Adventure launch/resume: `startAdventure4` / `resumeAdventure4`
- Route construction: `buildAdventure4PilotRoute`
- combat-first Hunt route: existing CLR-1/2/5 route logic
- battle/reward/loot: existing TextBattleScreen/BattleEngine pipeline

## Active-session behavior

Only one Adventure Session remains authoritative. If the selected Region already owns the active/suspended session, the Stage Hunt action resumes it. If another Region owns the active session, the Hunt button is disabled rather than creating a parallel run.

## Next

CLR-16 — Mobile Navigation & Playability Pass.
