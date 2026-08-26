# Blade Vale 3.0 — Official Roadmap

> **Status:** Active roadmap / source of truth for development toward Blade Vale 3.0.
>
> **Current:** Phase 12 — Content Expansion.
>
> Before starting a large feature, inspect current code/tests and check this roadmap first. This document supersedes older feature-addition roadmaps.

## Goal

Blade Vale already has a large foundation: text-command combat, Character Lv99,999, 25 chapter data sets (Ch1–15 core journey, Ch16–20 The Veil, Ch21–25 expansion arc), Jobs, Equipment/Affixes, Rune, Companions/Monster Ranch, Codex, Inheritance, Awakening, Artifact/Relic, Abyss, Bounty, Unique Trials, Secret Jobs, Settlement and World/Key-Dungeon systems.

The main risk is no longer lack of systems. It is **feature sprawl, weak connections, excessive scrolling, overloaded navigation, inconsistent UI, and story/endgame layers that do not yet feel like one coherent game**.

Development order:

**Audit → UI foundation → compact UI → progression → awakening → combat integration → world integration → equipment/job completion → settlement → endgame → story → content expansion → visual identity → final integration.**

Prefer connecting, finishing, simplifying or retiring existing systems over adding parallel systems.

---

## Implementation status

| Phase | Status | Notes |
|---|---|---|
| 0 System & UI Audit | ✅ | targeted audits continue when touching legacy areas |
| 1 UI / UX Foundation 3.0 | ✅ | preserve compact navigation rules |
| 2 Compact UI 3.0 | ✅ core | collection-scale polish continues |
| 3 Progression 3.0 | ✅ | Lv1–99,999 foundation + simulations |
| 4 Awakening 3.0 | ✅ | milestone/imprint foundation |
| 5 Battle Integration 3.0 | ✅ | Combat 3 integration foundation |
| 6 World 3.0 | ✅ | realms/branches/world foundation |
| 7 Equipment / Loot 3.0 Final | ✅ core | QoL additions scheduled below |
| 8 Job 3.0 Final | ✅ core | 56-job/Secret Job foundation |
| 9 Settlement 2.0 | ✅ core | deeper cross-system links scheduled |
| 10 Endgame 3.0 | ✅ | Official Phase 10 closed; see `PHASE10_FINAL_AUDIT.md` |
| 11 Adventure / Story 3.0 | ✅ | Story Canon + Ch1–25 + world mystery + Modern World tease complete |
| 12 Content Expansion | 🟡 CURRENT | expand playable variety through existing systems |
| 13 Visual Identity 3.0 | ⏭ | after content structure stabilizes |
| 14 Final Integration | ⏭ | feature freeze |

`LEVEL_ROADMAP_99999.md` Phase 10.1–10.7 is the completed **Lv99,999 progression/endgame tuning sub-roadmap**. It is distinct from Official Phase 10, which is also now complete.

---

# Phase definitions

## Phase 0 — System & UI Audit ✅

For every major system verify:

**data → state/save → UI → gameplay → rewards → cross-system integration → tests**

Files alone are never proof of completion. UI audits include action count, navigation depth, scroll cost, duplicated information, missing filters/search and mobile overflow.

## Phase 1 — UI / UX Foundation 3.0 ✅

- Home is not a growing vertical feature-button list.
- One dominant **Adventure** route.
- Related systems are grouped under Character / Companion / Base / Collection-style destinations.
- Common destinations target roughly ≤3 taps.
- Shared compact cards, tabs, badges, filters, detail drawers and comparison patterns.

Global information rule:

**Overview/list = identity + essential numbers + state → Detail = full stats/effects/lore/traits/history.**

## Phase 2 — Compact UI 3.0 ✅ core

Equipment, Ranch, Jobs and Codex must remain manageable at 100+ entries.

- compact list cards
- category/filter/sort
- favorite/lock/new states
- bulk actions where safe
- progressive disclosure
- delta-focused Item Compare
- never solve information growth by making every card taller

## Phase 3 — Progression 3.0 ✅

Character Lv1–99,999 is one coherent progression rather than a decorative cap. Canonical EXP/chapter/Abyss targets live in current progression code and `LEVEL_ROADMAP_99999.md`.

### Scheduled connected-play improvements

**Global NEXT Goal:** show one most meaningful next objective—story, Awakening, Job unlock, equipment threshold or endgame target.

**Continue / Recent / Favorites:** Adventure shortcuts for the current route, recently played stages and favorite farms. These stay inside Adventure; no new Home buttons.

## Phase 4 — Awakening 3.0 ✅

Awakening is a long-term spine, not a pile of small percentages. Canonical milestone foundation includes Lv90 / 300 / 700 / 3,000. Preserve save compatibility when retiring legacy concepts.

## Phase 5 — Battle Integration 3.0 ✅

Reuse and integrate existing:

- elements / weakness / resistance
- Break / Stagger
- statuses
- tactical AI
- boss phases
- formations/groups
- companion AI/commands
- weapon techniques
- job mechanics/resources

### Scheduled combat polish

**Enemy Intent:** readable tells should reward defense, Break, control and preparation without revealing every secret.

**Boss Signature Mechanics:** major bosses should have memorable rules—summons/guards, resource pressure, phase rules, Break timing, etc.—instead of HP-only difficulty.

## Phase 6 — World 3.0 ✅

Use a connected regional structure:

**World/Region → local stages/branches**

Key Dungeons, Secret areas, Heaven/Underworld, dimensional anomalies and exploration events should live inside this structure rather than become separate menu piles.

### Scheduled world polish

**Region Mastery UI:** compact progress for story/boss/secret/Codex/Unique/Companion/hidden events while preserving meaningful `?` states.

**Rumors:** Tavern/Settlement clues can point to World events, hidden bosses, routes or anomalies, connecting existing systems.

## Phase 7 — Equipment / Loot 3.0 Final ✅ core

Existing roles remain:

- normal gear = procedural optimization
- Unique = build-changing rule
- Set = multi-slot direction
- Relic/Artifact = high-level rule change

### Scheduled QoL

**Loot Filter / Safe Auto Dismantle:** filter by rarity, upgrade value, new-Codex state, Greater/Unique and protected states. Never silently destroy locked/favorite/protected gear.

**Build Loadouts:** a small number of presets for existing build components such as Job, equipment, Artifact and compatible Companion selections. Validate locked/missing items on switch. This is QoL, not a second equipment system.

## Phase 8 — Job 3.0 Final ✅ core

Maintain the 56-job foundation, specialization, legacy/master passives, resources, Secret Jobs and Job Codex. Secret Jobs are lateral/specialized, not strictly superior replacements. Loadouts must respect unlock/mastery rules.

## Phase 9 — Settlement 2.0 ✅ core

Settlement connects existing systems such as Blacksmith, Ranch, research, Tavern and exploration services, reducing Home clutter.

### Scheduled Settlement/Companion polish

**Expeditions:** return value into existing loops—regional materials, relic fragments, breeding/mutation resources, discovery clues or endgame information—rather than becoming a disconnected timer screen.

**Companion role readability:** expose concise damage/Break/support/defense/sustain/farming-style role summaries without removing deeper traits/builds.

---

## Phase 10 — Endgame 3.0 ✅ COMPLETE

Official Phase 10 is closed. Full audit: `PHASE10_FINAL_AUDIT.md`.

### 10-A Abyss 3 — ✅

Pacts, Challenges, Routes, Run Build, long-term scaling and target-farm foundations exist.

### 10-B Nemesis — ✅

Nemesis 3.0 provides personal evolving targets.

### 10-C World Tier — ✅

World Tier is integrated into Adventure/stage flow. Do not create a parallel difficulty selector.

### 10-D Transcendent regions — ✅ mapped

World3 Realms, Secret Realms, dimensional/rift content and Machine World collectively fill this role. Expand them rather than creating another region framework.

### 10-E Raid Bosses — ✅

First Raid implemented:

**RAID：境界王アルケオン・零界再臨**

- unlock: Abyss 10F
- recommended Lv3,000 / target IP3,000
- existing Abyss/Endgame route; no Home button
- preparation surface with danger/mechanic/counter/reward hints
- Guard escorts + four phases + shrinking Break windows
- moderate numeric uplift; mechanics matter more than HP
- existing Ch25 equipment/EXP/Gold economy; no new currency
- clear state uses existing `stageProgress`
- regression coverage in `tests/phase10-raid-boss.test.js`

### 10-F Challenge Bosses — ✅ mapped

Unique Trials + Boss Encounter conditions already fill the build-test/mastery role. Future prestige rewards may extend Titles/Records; do not add a duplicate Challenge Boss menu.

---

## Phase 11 — Adventure / Story 3.0 ✅ COMPLETE

Connect the world into one narrative:

**Human Realm → Heaven → Underworld → Dimensional Boundary → Modern World**

Central mystery:

**Why are Blade Vale's world and the modern world connected?**

Story supports exploration and systems; it must not become a separate visual-novel layer.

### 11.1 Story Canon ✅

The Human / Heaven / Underworld / Boundary / Machine / Modern layers, player objective, The Veil and endgame meanings have one canonical source.

### 11.2 Ch1–15 Story Pass ✅

Compact objectives, discoveries, boss lines and clear records now live in the existing text-battle flow.

### 11.3 The Veil — Ch16–20 ✅

The second act establishes The Veil, outside intrusion and the Ch20 guardian reversal.

### 11.4 World Mystery Integration ✅

Key Dungeons, Secret Realms, Nemesis, Machine World, Unique Trials, artifacts/relics, Raid and anomalies have narrative meaning.

### 11.5 Ch21–25 Integration ✅

Existing outer-world chapters form the third act and lead through the Boundary Throne to the Eighth Key / Machine World.

### 11.6 Modern World Tease ✅

Controlled sensory fragments—architecture, signals, rail-like vibration, date notation, a thin device and familiar writing—hint at the Modern World while the connection reason stays unresolved.

Full evidence: `PHASE11_STORY_STATUS.md`.

---

## Phase 12 — Content Expansion 🟡 CURRENT

Only after systems/story stabilize, increase volume. **Content should deepen existing loops rather than create another menu or progression layer.**

Long-term guidelines, not quotas:

- Regions 30–40
- Normal monsters 150+
- Bosses 50+
- Recruitable species 80+
- Mutations 30–50
- Unique equipment 100+
- Artifact / Relic 100+
- Key Dungeon content 50+

Prefer reusable archetypes/modifiers/events over near-identical hand-authored entries. Canonical Lv99,999/IP10,000 progression functions remain the source of truth for endgame recommendations.

### 12.1 Boundary Ruins Pack I 🟡

Add four optional Secret Realm discoveries through the existing Abyss exploration flow: **残響観測塔 / 沈降鋳造所 / 記憶果樹園 / 零番境界駅**. Each has a distinct enemy/boss identity and reuses existing Set, Gold/EXP, stage progress and exploration-fragment systems. No Home button, new currency or save schema.

### 12.2 Recruitable Species Pack I ⏭

Increase Monster Ranch / Companion variety using the existing recruitment, role, breeding, mutation and bond systems. Tie acquisition to existing regions/content instead of a parallel capture menu.

### 12.3 Unique / Artifact / Relic Pack I ⏭

Increase build-changing rewards with distinct rules and target-farm locations. Do not pad counts with percentage-only variants.

### 12.4 Boss Pack / Signature Encounters ⏭

Add memorable bosses through existing Battle 3 boss vocabulary—Intent, escorts, phases, Break windows and resource pressure—not HP-only inflation.

### 12.5 Region / World Event Density ⏭

Increase reusable events, routes and regional discoveries while keeping Adventure navigation compact.

### 12.6 Titles / Personal Records ⏭

Add lightweight prestige/history such as deepest Abyss, largest damage, fastest boss clear, highest Item Power and collection feats. Avoid turning Titles into another mandatory power ladder.

Detailed status: `PHASE12_CONTENT_STATUS.md`.

## Phase 13 — Visual Identity 3.0

- replace emoji-dependent UI gradually with consistent pixel/icon assets
- standardize spacing, typography, button hierarchy, cards, borders/shadows, rarity and semantic colors
- hierarchy: **name/title → important state/numbers → secondary explanation**
- restrained battle/drop feedback: shake/flash, Critical/Break emphasis, phase transitions, rare-drop reveals, SE/music hooks

## Phase 14 — Blade Vale 3.0 Final Integration

**Feature freeze. No new large systems.**

Final audit includes:

1. Cross-system reward loops
2. Lv1–99,999 curve
3. economy/material/key balance
4. Job balance
5. Monster/Boss/Raid balance
6. Equipment/drop/Loot Filter safety
7. Companion/Ranch/Expedition balance
8. save compatibility/migrations/loadouts
9. monkey-patch/load-order audit
10. performance
11. mobile viewport/UI
12. new-game full playthrough
13. postgame/endgame playthrough
14. high-level simulations
15. full CI
16. NEXT Goal validity
17. recent/favorite route usability
18. titles/records consistency

### Final UI acceptance

- Home primary actions fit roughly in one phone viewport.
- Common functions require roughly ≤3 taps from a primary navigation surface.
- Equipment and Ranch remain manageable at 100+ entries.
- Collection screens use categories/filtering.
- Detail text uses progressive disclosure.
- Routine screens avoid excessive scrolling.
- Mobile one-handed use is the default interaction model.
- Generic emoji are no longer the primary visual language.
- Overview → Detail is the default information pattern.

When all gates pass:

# BLADE VALE 3.0

---

# Connected-play improvement priority

These items are assigned to phases above; this is **not a parallel roadmap**.

### S — high impact

- Global NEXT Goal
- Build Loadouts
- Loot Filter / safe auto dismantle
- Continue / Recent / Favorite stages

### A — strong integration polish

- Enemy Intent strengthening
- Boss Signature Mechanics
- Item Compare deltas
- Region Mastery UI
- Companion role readability
- Codex Lore

### B — long-term depth / recognition

- Rumors
- Expedition integration
- Titles
- Personal Records

---

# Development Order

```text
COMPLETED FOUNDATION
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

CURRENT
Phase 12    Content Expansion + long-term recognition
   |
   v
Phase 13    Visual Identity 3.0
   |
   v
Phase 14    Final Integration / feature freeze
   |
   v
BLADE VALE 3.0
```

---

# Development Rules for Claude Code / Codex / Contributors

1. **Read this ROADMAP.md before proposing or implementing a major feature.**
2. Inspect current code/tests before assuming an old phase is missing.
3. Prefer finishing, connecting, simplifying or retiring existing systems over parallel systems.
4. Before adding a top-level Home button, prove the feature cannot fit an existing navigation group.
5. Do not solve information growth by making cards taller. Use Overview → Detail, filters, tabs and comparisons.
6. Mobile is the primary UX target.
7. Preserve save compatibility or provide an explicit migration.
8. Large phases follow **implementation → automated tests → balance/simulation where relevant → CI → main → next phase**.
9. A feature is not complete until gameplay, UI, rewards, persistence and cross-system integration are verified.
10. Avoid a new currency unless an existing one cannot serve the role.
11. Avoid unnecessary monkey patches; consolidate heavily patched areas where practical.
12. Content quantity comes after stability.
13. Lv99,999 is a design commitment; evaluate progression/endgame across the full curve.
14. UI quality is a completion criterion.
15. Phase 14 feature freeze is strict.

## Core Design Principles

1. Undiscovered content remains meaningfully undiscovered.
2. Prefer decisions/playstyles over percentage inflation.
3. Connect existing systems; avoid isolated menus.
4. Failure, revisiting and collecting should have purpose.
5. Trials demonstrate mastery, not only grind time.
6. The player can understand the next meaningful goal without source code.
7. A large game does not require a cluttered interface.
8. Preserve text-RPG identity while becoming cleaner, faster and more readable.
9. Reuse canonical progression/reward sources; do not invent conflicting parallel tables.
