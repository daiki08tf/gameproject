# Phase 11 — Adventure / Story 3.0 Status

## Current status

- **11.1 Story Canon — ✅ Complete**
- **11.2 Ch1–15 Story Pass — ✅ Complete**
- **11.3 The Veil Ch16–20 — ✅ Complete**
- **11.4 World Mystery Integration — ✅ Complete**
- **11.5 Ch21–25 Integration — NEXT**
- 11.6 Modern World Tease — queued

## Completion evidence

### 11.1 Story Canon
- `js/data/storyCanon.js` is the canonical machine-readable narrative model.
- `STORY_CANON.md` is the contributor-facing reference.
- `js/data/worldVeil.js` consumes the canonical Veil definition.
- Endgame systems have in-world meanings and Modern World remains deliberately unresolved.

### 11.2 Ch1–15 Story Pass
- `js/data/storyChapters1to15.js` defines compact objectives, discoveries, boss confrontations and clear records.
- `js/patches/story11CoreJourney.js` embeds story in the existing text-battle flow.
- No progression, reward, enemy, unlock or save-schema changes.

### 11.3 The Veil Ch16–20
- `js/data/storyChapters16to20.js` turns the existing five expanded chapters into one second-act arc.
- Ch16 establishes the seven-seal structure after Black Iron Machine Castle fails.
- Ch17 reveals that the beings described as heavenly are outside observers rather than simple gods.
- Ch18 proves intrusion from outside the world layer.
- Ch19 is the first explicit in-game naming and definition of **The Veil** as a multi-world boundary network.
- Ch20 reverses the player's assumption: the Primordial Beast Abyss was the last inner guardian holding the breach shut.
- `story11CoreJourney.js` now supports Ch1–20 through the same compact battle-log route.
- Branch/bounty routes remain free of mandatory story exposition.
- Lv700→3,000 tuning, stage ids, rewards, unlocks and saves are unchanged.
- `tests/phase11-veil-story.test.js` guards reveal order, guardian truth and branch isolation.

### 11.4 World Mystery Integration
- `js/data/storyWorldMystery.js` provides one shared narrative vocabulary for Abyss, World Tier, Key Dungeons, Secret Realms, Nemesis, Unique Trials, Raid, Machine World, Artifacts/Relics and anomalies.
- Existing text battles surface optional content discoveries as compact `【境界観測】` lines; no new story screen or Home action is introduced.
- Abyss observations are milestone-only at 1 / 100 / 500 / 1000 / 2000 / 3000F so repeat farming is not flooded with exposition.
- Machine World observations escalate by district from boundary management to the discovery that the managers themselves are being observed.
- Nemesis is framed as a creature learning from boundary echoes; Unique Trials replay conditions recorded in equipment.
- Artifacts preserve old combat records, while Relics are fragments of world laws capable of changing battle rules.
- The anomaly route remains deliberately unresolved: machine-like signals are confirmed external, but no modern-world place or identity is named yet.
- All gameplay rewards, combat values, unlocks, stage ids, save schema and progression remain unchanged.
- `tests/phase11-world-mystery.test.js` guards system coverage, reveal cadence, anomaly secrecy, battle-log integration and gameplay immutability.

## Next: 11.5 Ch21–25 Integration

Turn the existing Ch21–25 regions and bosses into the next coherent story arc after The Veil breach. Reuse current regional exploration, hidden bosses, Eighth Key and Machine World connections; do not replace their gameplay systems or reveal the Modern World early.
