# Blade Vale — Official Roadmap

> **Source of truth for ChatGPT / Claude Code / Codex / contributors.**
>
> **Current:** Blade Vale 3.0 foundation + System Deepening Pack are complete. **Content Pack II is current.**
>
> **Current batch:** CP2-A+B ✅ → **CP2-C+D NEXT** → CP2-E → Story Expansion I (Ch26–30) → Content Pack III.
>
> Before major work, read this file, `SYSTEM_DEEPENING_ROADMAP.md`, and `CONTENT_PACK_II_ROADMAP.md`.

## Core direction

Blade Vale is a personal evolving text-command hack-and-slash RPG built around one connected journey:

**Main Story → exploration → combat/builds → loot → companions → rumors/clues → secrets → endgame → replay → back into exploration**

The game already has enough system breadth. New work should deepen and connect existing systems, then feed substantial horizontal content into them.

## Permanent design rules

1. Character Lv cap remains **99,999** unless an explicit future story/design decision changes it.
2. Do not add a new currency merely to separate a content pack.
3. Reuse Adventure, World, Secret Realm, Codex, Ranch, Equipment, Job, Settlement and existing save structures before adding top-level systems.
4. Avoid new Home buttons when an existing grouped destination can host the feature.
5. Mobile command reachability is non-negotiable. Enemy count/log length must never make battle commands unreachable.
6. New enemies/Bosses need gameplay identity, not HP/color-only variants.
7. Rare/Unique rewards should enable builds or collection goals rather than become universal mandatory BiS.
8. Optional horizontal content must remain optional for main-story progression.
9. Undiscovered secrets should remain meaningfully undiscovered; hints may guide without becoming a wiki.
10. Preserve save compatibility and add automated regression coverage for significant changes.
11. Prefer **systems talking to each other** over parallel feature stacks.
12. Phase 13.4 Rotating Challenges remains intentionally omitted: no daily/weekly/FOMO schedule.
13. Boss conditional Hidden Drop objectives remain **deferred** unless explicitly re-enabled.
14. Modern World evidence stays restrained until the story deliberately authorizes a reveal; do not casually state Japan/Tokyo.

---

# Completed foundation

| Area | Status | Notes |
|---|---|---|
| Phase 0–2 | ✅ | System/UI audit, grouped navigation, compact collection UI |
| Phase 3–4 | ✅ | Lv1–99,999 progression + Awakening foundation |
| Phase 5 | ✅ | Text battle / Combat 3 integration |
| Phase 6 | ✅ | Connected World / regions / exploration |
| Phase 7 | ✅ core | Equipment, affixes, Unique, Set, Artifact, Relic |
| Phase 8 | ✅ core | 56-Job foundation, MASTER/Secret Job systems |
| Phase 9 | ✅ core | Settlement / Ranch / cross-system services |
| Phase 10 | ✅ | Abyss, Nemesis, World Tier, Raid/endgame |
| Phase 11 | ✅ | Ch1–25 + The Veil / outer-world mystery |
| Phase 12 | ✅ | Horizontal dungeons, ecology, rare hunt, lore, rumors, Codex, Apex |
| Phase 13 | ✅ | Challenge, records, titles, REMATCH+, Build Feats; rotating challenges omitted |
| Phase 14 | ✅ | Navigation, loadouts, visual integration, mobile safety |
| Automated RC Audit | ✅ | cross-system / progression / equipment / Ranch / mobile gates |
| System Deepening Pack | ✅ | Build identities, Job synergy, Enemy Intent, Companion individuality, Codex Field Guide, Rare presentation, Rumor Notebook, Region knowledge, Treasure clues, Secret Chains |

Canonical detail docs:
- `LEVEL_ROADMAP_99999.md`
- `STORY_CANON.md`
- `PHASE10_FINAL_AUDIT.md`
- `PHASE11_STORY_STATUS.md`
- `PHASE12_CONTENT_STATUS.md`
- `PHASE13_REPLAY_STATUS.md`
- `PHASE14_FINAL_INTEGRATION_STATUS.md`
- `RELEASE_CANDIDATE_AUDIT.md`
- `SYSTEM_DEEPENING_ROADMAP.md`

---

# CURRENT — Content Pack II

Detailed specification and handoff: **`CONTENT_PACK_II_ROADMAP.md`**.

Purpose: use the System Deepening infrastructure to make the world feel dense, mysterious, revisitable and interconnected.

## Batch 1 — CP2-A+B ✅ COMPLETE

### CP2-A — Rumor & Hidden Encounter Expansion
- 10 new diegetic rumors across the five Phase12 horizontal ecologies
- 5 rumor-gated Hidden Encounter variants
- unresolved rumor means no hidden encounter roll
- Region Mastery / Codex knowledge provide only small relative pursuit benefits
- exact percentages remain hidden from player-facing text
- Hidden Encounters enter as a later compact one-enemy encounter, never enlarge the opening enemy pile

### CP2-B — Treasure / Hidden Route Expansion
Five route discoveries now grow out of actually observing the new hidden ecology:
- 空列の回廊
- 無音の産室
- 第八肋骨路
- 逆棚回廊
- 盲壁観測孔

They reuse `world2.discoveries` and the existing Rumor/Codex surfaces. No map currency or new screen.

## Batch 2 — CP2-C+D ⏭ NEXT

### CP2-C — Secret Chain Expansion
Create 2–3 authored multi-region chains using the A+B route leads.

Targets:
- Silent Beast chain → Rare Companion / breeding lead
- Eighth Rib chain → observation-network hidden site
- Blind Wall chain → high-end mystery encounter

At least two chains should span 3+ existing locations and provide real revisit value.

### CP2-D — Hidden Boss & Reward Layer
Directional target for this batch:
- ~4–6 Hidden/elite Boss encounters
- ~6–10 recruitable/secret/breeding Companion additions
- ~10–15 Unique/Relic/content rewards
- new Codex/Lore connections

Do **not** implement SD-4-style timed/no-death/finisher Hidden Drop conditions.

## Batch 3 — CP2-E

World Mystery Integration + density/tuning pass:
- resolve and cross-link rumors
- expand Codex ecology
- finish Lore connections
- audit Region Mastery clue usefulness
- ensure all Hidden Routes lead somewhere worthwhile
- audit repetitive grind
- verify the game provides enough in-world clues without external notes
- full save/mobile/CI regression

Directional full Content Pack II scale remains roughly:
- 5–8 optional major locations/routes/dungeons
- 30–40 authored enemies/variants
- 8–12 Boss/elite encounters
- 15–20 companion additions
- 20–30 meaningful Unique/Relic/content rewards

These are design targets, not quotas. **Connection matters more than raw count.**

---

# AFTER — Story Expansion I

Planned story growth: **Ch26–30**.

Direction:
- continue from Ch25 outer-world arc
- deepen Eighth Key / external signal / Veil anomalies
- strengthen modern-world evidence gradually
- do not abruptly reveal Japan/Tokyo unless the story deliberately reaches that point
- preserve the central question: **why are Blade Vale and the external modern world connected?**

---

# THEN — Content Pack III

Return to horizontal expansion after Ch26–30.

```text
SYSTEM DEEPENING ✅
      ↓
CONTENT PACK II ← CURRENT
      ↓
STORY EXPANSION I (Ch26–30)
      ↓
CONTENT PACK III
      ↓
PLAY / TUNE / DEEPEN
      ↺
```

## AI handoff / new conversation rules

When a new ChatGPT conversation, Claude Code session or coding agent starts:
1. read `ROADMAP.md`
2. read `SYSTEM_DEEPENING_ROADMAP.md`
3. read `CONTENT_PACK_II_ROADMAP.md`
4. inspect code/tests before assuming a listed item is missing
5. **do not redo CP2-A+B**
6. next work is **CP2-C Secret Chains + CP2-D Hidden Boss/Reward Layer**
7. keep Boss conditional Hidden Drops and rotating challenges omitted
8. preserve automatic Rumor Notebook accumulation and existing `world2.discoveries`
9. no new Home route/currency unless an explicit future decision requires one
10. preserve permanent many-enemies command reachability regression
11. run both CI workflows and update roadmap/handoff before merge

## Current one-line handoff

**System Deepening is complete. Content Pack II A+B is complete with 10 new rumors, 5 rumor-gated Hidden Encounters and 5 Hidden Routes. NEXT: CP2-C multi-region Secret Chains + CP2-D Hidden Boss/Companion/Unique reward layer; SD-4 and rotating challenges remain omitted.**
