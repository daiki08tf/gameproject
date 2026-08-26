# Blade Vale — Official Roadmap

> **Source of truth for ChatGPT / Claude Code / Codex / contributors.**
>
> **Current:** Blade Vale 3.0 foundation + System Deepening Pack are complete. **Content Pack II is current.**
>
> **Current batch:** CP2-A+B ✅ → CP2-C+D ✅ → **CP2-E NEXT** → Story Expansion I (Ch26–30) → Content Pack III.
>
> Before major work, read this file, `SYSTEM_DEEPENING_ROADMAP.md`, and `CONTENT_PACK_II_ROADMAP.md`.

## Core direction

Blade Vale is a personal evolving text-command hack-and-slash RPG built around one connected journey:

**Main Story → exploration → combat/builds → loot → companions → rumors/clues → secrets → endgame → replay → back into exploration**

New work should deepen and connect existing systems rather than create isolated progression stacks.

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

Canonical detail docs include `STORY_CANON.md`, `SYSTEM_DEEPENING_ROADMAP.md`, and `CONTENT_PACK_II_ROADMAP.md`.

---

# CURRENT — Content Pack II

Detailed specification and handoff: **`CONTENT_PACK_II_ROADMAP.md`**.

Purpose: use the System Deepening infrastructure to make the world feel dense, mysterious, revisitable and interconnected.

## Batch 1 — CP2-A+B ✅ COMPLETE

- 10 new diegetic rumors across the five Phase12 horizontal ecologies
- 5 rumor-gated Hidden Encounter variants
- 5 Hidden Routes: 空列の回廊 / 無音の産室 / 第八肋骨路 / 逆棚回廊 / 盲壁観測孔
- unresolved rumor = no hidden encounter roll
- Region Mastery / Codex knowledge provide only small relative pursuit benefits
- Hidden Encounters enter as later one-enemy encounters, never enlarge the opening enemy pile
- existing `world2.discoveries`, Rumor Notebook and Codex surfaces reused

## Batch 2 — CP2-C+D ✅ COMPLETE

### Secret Chains — 3

- **声なき獣の系譜** — 無音の産室 → 空列の回廊 → 盲壁観測孔
- **第八肋骨の行先** — 第八肋骨路 → 逆棚回廊 → 零番境界駅
- **盲壁の二重観測** — 盲壁観測孔 → 逆棚回廊 → 埋もれた観測座標

All chains are optional, progress in the existing Rumor Notebook and preserve central mystery restraint.

### Hidden Boss / Reward Layer

Five chain-gated Hidden Bosses:
- 無鳴母獣・NEST-MOTHER
- 灰角残響獣・CINDER-HART
- 第八脈守・OCTAVE
- 重記司書・PALIMPSEST
- 双方向観測体・PARALLAX

Content rewards:
- 6 secret companions
- 4 deterministic special breeding hybrids
- 12 fixed mythic Unique rewards

Reward policy:
- chain completion reveals a Hidden Boss
- first successful clear grants fixed rewards
- no random conditional Boss-drop objective
- no timed kill / no-death / Break-finisher requirement
- SD-4 remains deferred

Hidden Bosses are appended as one-enemy encounter groups through the existing battle queue, preserving mobile command safety.

## Batch 3 — CP2-E ⏭ NEXT

**World Mystery Integration + Content Density Pass.**

Scope:
- close the full Rumor → Hidden Encounter → Hidden Route → Secret Chain → Hidden Boss loop
- integrate CP2 enemies/Bosses into Codex ecology and knowledge text
- connect chain Lore to The Veil / observation network / Eighth Key / external-signal mystery
- keep the unknown observed subject unresolved and unlocated
- audit reward density and universal-BiS risk
- audit repeated revisit/grind friction
- ensure no clue requires external notes
- compact Rumor Notebook with increased entry count
- ensure Ranch / Equipment remain manageable after additions
- save compatibility and full mobile regression
- run both CI workflows and mark Content Pack II COMPLETE

After E, next work becomes **Story Expansion I — Ch26–30**.

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

```text
SYSTEM DEEPENING ✅
      ↓
CONTENT PACK II ← CURRENT / E NEXT
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
5. **do not redo CP2-A+B or CP2-C+D**
6. next work is **CP2-E World Mystery Integration + Content Density Pass**
7. keep Boss conditional Hidden Drops and rotating challenges omitted
8. preserve automatic Rumor Notebook accumulation and existing `world2.discoveries`
9. no new Home route/currency unless an explicit future decision requires one
10. preserve permanent many-enemies command reachability regression
11. run both CI workflows and update roadmap/handoff before merge

## Current one-line handoff

**System Deepening and Content Pack II A+B/C+D are complete. Current implementation has 10 CP2 rumors, 5 Hidden Encounters, 5 Hidden Routes, 3 multi-region Secret Chains, 5 Hidden Bosses, 6 secret companions, 4 special hybrids and 12 fixed Unique rewards. NEXT: CP2-E integration/tuning, then Story Expansion I (Ch26–30). SD-4 and rotating challenges remain omitted.**
