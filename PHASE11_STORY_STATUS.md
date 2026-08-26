# Phase 11 — Adventure / Story 3.0 Status

## Current status

- **11.1 Story Canon — ✅ Complete**
- **11.2 Ch1–15 Story Pass — ✅ Complete**
- **11.3 The Veil Ch16–20 — ✅ Complete**
- **11.4 World Mystery Integration — ✅ Complete**
- **11.5 Ch21–25 Integration — ✅ Complete**
- **11.6 Modern World Tease — NEXT**

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
- `story11CoreJourney.js` supports Ch1–20 through the same compact battle-log route.
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

### 11.5 Ch21–25 Integration
- `js/data/storyChapters21to25.js` turns the five existing outer regions into the third story act: **外縁世界**.
- Ch21 establishes that the world beyond the breach contains old civilizations connected to the same boundary network.
- Ch22 reveals repeated reconstruction of the same world coordinates and introduces the idea of selection rather than simple preservation.
- Ch23 traces ancient anti-intrusion defenses and gives the first clear shape to an unregistered **eighth connection**.
- Ch24 reveals that routes were deliberately erased from collective memory and ties the hidden connection to the Boundary Throne.
- Ch25 identifies Blade Vale as one node in a wider boundary network, explains the Eighth Key as an exception outside the normal management system, and ends by naming only its next destination: **機界**.
- `story11CoreJourney.js` now supports Ch1–25 through the same compact battle-log story layer.
- Branch routes remain optional and carry no mandatory main-story exposition.
- Modern-world names, locations and devices remain unrevealed until 11.6.
- No stage ids, chapter progression numbers, rewards, combat values, unlock rules or save schema were changed.
- `tests/phase11-outer-world-story.test.js` guards chapter coverage, reveal escalation, branch isolation, Modern World secrecy and progression-data immutability.

## Next: 11.6 Modern World Tease

Add controlled sensory fragments beyond the Machine World / Eighth Key: train-like vibration, ordered city lights, date-like notation, communication-device fragments and Japanese-like text patterns. Keep the final reason Blade Vale and the Modern World are connected unresolved; Phase 11 should end with a strong hook rather than a full cosmology dump.
