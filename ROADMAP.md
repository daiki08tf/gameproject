# Blade Vale — Official Roadmap

> **Source of truth for ChatGPT / Claude Code / Codex / contributors.**
>
> **Current:** Blade Vale 3.0 foundation, Phase 0–14 and automated RC audit are complete. Development continues as a personal evolving RPG rather than a commercial release train.
>
> **NEXT:** `System Deepening Pack` → `Content Pack II` → `Story Expansion I (Ch26–30)` → `Content Pack III`.
>
> Read this file and `SYSTEM_DEEPENING_ROADMAP.md` before proposing or implementing a major change.

## Core direction

Blade Vale is a text-command hack-and-slash RPG built around one connected journey:

**Main Story → exploration → combat/builds → loot → companions → rumors/clues → secrets → endgame → replay → back into exploration**

The game already has enough system breadth. The next priority is **depth and cross-system connection**, followed by substantial horizontal content expansion.

### Permanent design rules

1. Character Lv cap remains **99,999** unless a future explicit story/design decision changes it.
2. Do not add a new currency merely to separate a content pack.
3. Reuse Adventure, World, Secret Realm, Codex, Ranch, Equipment, Job, Settlement and existing save structures before adding new top-level systems.
4. Avoid new Home buttons when an existing grouped destination can host the feature.
5. Mobile command reachability is non-negotiable. Enemy count/log length must never make battle commands unreachable.
6. New enemies/Bosses need gameplay identity, not HP/color-only variants.
7. Rare/Unique rewards should enable builds or collection goals rather than become universal mandatory BiS.
8. Optional horizontal content must remain optional for main-story progression.
9. Undiscovered secrets should remain meaningfully undiscovered; hints may guide without becoming a wiki.
10. Preserve save compatibility and add automated regression coverage for significant changes.
11. Prefer **systems talking to each other** over parallel feature stacks.
12. Phase 13.4 Rotating Challenges remains intentionally omitted: no daily/weekly/FOMO schedule.
13. Boss conditional Hidden Drop objectives are currently **deferred**, not part of System Deepening Pack.

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
| Phase 11 | ✅ | Ch1–25 + The Veil / outer-world mystery / controlled Modern World tease |
| Phase 12 | ✅ | Horizontal dungeons, ecology, rare hunt, lore, rumors, Codex, Apex |
| Phase 13 | ✅ | Challenge, records, titles, REMATCH+, Build Feats; 13.4 omitted |
| Phase 14 | ✅ | Navigation, loadouts, visual integration, mobile safety |
| Automated RC Audit | ✅ | cross-system / progression / equipment / Ranch / mobile regression gates |

Canonical detail documents remain valid:

- `LEVEL_ROADMAP_99999.md`
- `STORY_CANON.md`
- `PHASE10_FINAL_AUDIT.md`
- `PHASE11_STORY_STATUS.md`
- `PHASE12_CONTENT_STATUS.md`
- `PHASE13_REPLAY_STATUS.md`
- `PHASE14_FINAL_INTEGRATION_STATUS.md`
- `RELEASE_CANDIDATE_AUDIT.md`

---

# CURRENT — System Deepening Pack

Detailed specification: **`SYSTEM_DEEPENING_ROADMAP.md`**.

The purpose is not to add another giant progression layer. It is to make existing systems generate more decisions, discoveries and reasons to revisit content.

## Pack A — BUILD / COMBAT

### SD-1 Unique / Relic Build Identity

Strengthen existing Unique/Relic identities so a drop can suggest a new build rather than only increase Item Power.

Focus:
- conditional effects
- trigger-based effects
- synergy tags
- Break / Guard / Analysis / element / resource / companion-role interactions
- deliberate tradeoffs instead of universal upgrades

### SD-2 Job Synergy Deepening

MASTER Jobs should remain interesting after mastery.

Focus:
- Job identity/passive interactions
- weapon synergy
- Break / Guard / Analysis / element interactions
- Companion role synergy
- lateral build choices, not another Job level ladder

### SD-8 Enemy Intent

Add readable pre-action intent/telegraph information to combat.

Focus:
- Attack / Guard / Cast / Summon / Danger-style intent classes
- Bosses may use authored lore-flavored telegraphs
- enough information to make decisions, not exact damage spoilers
- command area safety must remain intact on mobile

## Pack B — COLLECTION

### SD-3 Companion Individuality

Add light individuality without creating an exhausting IV grind.

Focus:
- personality with small tradeoffs
- rare traits with modest effects
- cosmetic/prestige epithets
- retain species/role readability

### SD-5 Codex as an In-Game Field Guide

Codex knowledge should deepen with encounters/kills.

Possible reveal ladder:
- encounter: identity / unknown fields
- early kills: rough HP/behavior
- additional kills: weakness / Break tendency
- later kills: ordinary drops
- mastery: rare clues / habitat hints

Exact thresholds may vary by enemy class.

### SD-11 Rare Encounter Presentation

Rare encounters should feel rare when they occur.

Focus:
- short authored pre-encounter text
- semantic `RARE ENCOUNTER` identity
- special discovery/result feedback
- no layout that pushes battle commands out of reach

## Pack C — EXPLORATION INTELLIGENCE

### SD-6 Rumor Notebook — central feature

Rumors automatically accumulate in an existing Adventure/World/Codex-adjacent surface. The player should not need to manually take notes.

Rumor states:
- **Unresolved**
- **Clue Found / Tracking**
- **Resolved**

Sources may include:
- World Events
- NPC/event outcomes
- Lore Fragments
- Secret Realm discoveries
- Rare encounters
- Codex discoveries
- clue/map items

Rules:
- automatically record and update rumors
- hints stay diegetic and incomplete
- never show exact spawn percentages/coordinates as ordinary rumor text
- resolution can reveal the actual subject after discovery
- reuse existing World/Discovery persistence where practical; avoid a second unrelated lore database

### SD-7 Region Mastery Benefits

Regional mastery gains small convenience/knowledge benefits, not mandatory combat power.

Candidates:
- tiny relative rare-encounter bonus
- stronger unresolved-rumor hints
- slight local recruitment knowledge bonus
- improved treasure/secret clues

Benefits must stay small enough that unfinished mastery does not feel punitive.

### SD-10 Treasure Maps / Clue Items

Add textual clue items that point toward existing or future locations.

Examples:
- torn maps
- coordinate fragments
- damaged survey notes
- symbolic directions

Rewards can be existing Gold/material/equipment/Lore/Rumor/Companion-related rewards. Map chains are allowed. No treasure-map currency.

### SD-9 Secret Chains

Secrets can reference other secrets and cause meaningful revisits.

Pattern example:

**Old King Tomb clue → Inverted Library interpretation → Dragonbone Canyon location → hidden route/encounter**

Rules:
- clues should be understandable without source-code knowledge
- do not make long secret chains mandatory for main story
- reuse existing exploration/Secret Realm routes
- may foreshadow the central mystery without resolving it prematurely

## SD-4 — DEFERRED

**Boss conditional Hidden Drop objectives are deliberately postponed.**

Do not sneak them into SD Pack under another name. They can be reconsidered later as a dedicated Boss Deepening pass.

---

# NEXT — Content Pack II

After System Deepening is stable, use the strengthened systems to add substantial horizontal content.

Target scale is directional, not a quota:

- ~5–8 optional dungeons / major optional locations
- ~30–40 authored enemies/variants across distinct ecologies
- ~8–12 Boss/elite encounters
- ~15–20 recruitable/secret/breeding companion additions
- ~20–30 meaningful Unique/Relic/content rewards
- new Rumors / Lore / Codex entries
- Rare encounters
- Treasure Maps / clue chains
- Secret Chains

The important requirement is **connection**, not raw count. A new dungeon should ideally participate in several existing loops: loot, companion hunt, Codex, rumor, lore, secret chain, mastery, rare hunt or build testing.

---

# AFTER THAT — Story Expansion I

Planned story growth: **Ch26–30**.

Direction:
- continue from the Ch25 outer-world arc
- deepen the Eighth Key / external signal / Veil anomalies
- strengthen modern-world evidence gradually
- do not abruptly reveal Japan/Tokyo unless the story deliberately reaches that point
- preserve the central question: **why are Blade Vale and the external modern world connected?**

Story Expansion should introduce new vertical narrative content while continuing to feed horizontal exploration rather than replacing it.

---

# THEN — Content Pack III

Return to horizontal expansion after the new story arc.

The intended development rhythm is:

```text
SYSTEM DEEPENING
      ↓
CONTENT PACK II
      ↓
STORY EXPANSION I (Ch26–30)
      ↓
CONTENT PACK III
      ↓
PLAY / TUNE / DEEPEN
      ↺
```

This replaces the old idea of endlessly creating Phase 15, 16, 17... as isolated system layers.

---

# Development order for current work

```text
CURRENT
Pack A — BUILD / COMBAT
  SD-1 Unique / Relic
  SD-2 Job Synergy
  SD-8 Enemy Intent
      ↓
Pack B — COLLECTION
  SD-3 Companion Individuality
  SD-5 Codex Field Guide
  SD-11 Rare Encounter Presentation
      ↓
Pack C — EXPLORATION INTELLIGENCE
  SD-6 Rumor Notebook
  SD-7 Region Mastery Benefits
  SD-10 Treasure Maps
  SD-9 Secret Chains
      ↓
SYSTEM DEEPENING COMPLETE
      ↓
CONTENT PACK II
```

Large coherent batches are preferred over one tiny PR per bullet, provided tests remain readable and regressions are isolated.

---

# Rules for AI handoff / new conversations

When a new ChatGPT conversation, Claude Code session or other coding agent starts:

1. Read `ROADMAP.md`.
2. Read `SYSTEM_DEEPENING_ROADMAP.md` while System Deepening is current.
3. Inspect the current implementation/tests before assuming a listed item is missing.
4. Continue from the first unchecked/current item rather than recreating completed Phase 0–14 work.
5. Do not implement SD-4 Boss conditional Hidden Drops unless the owner explicitly re-enables it.
6. Do not implement rotating daily/weekly challenges.
7. Rumors should automatically accumulate in the Rumor Notebook and progress through discovery states.
8. Prefer existing save roots/routes and lazy initialization over parallel persistence.
9. Every combat/UI change must preserve the permanent many-enemies command-reachability regression contract.
10. Update roadmap/status documentation whenever a coherent pack is completed so another agent can resume without conversation history.

## Current one-line handoff

**Blade Vale 3.0 foundation is complete; next work is System Deepening Pack A (Unique/Relic build identity → Job synergy → Enemy Intent), then Collection Pack B, then Exploration Intelligence Pack C centered on an automatic Rumor Notebook; SD-4 and rotating challenges are omitted.**
