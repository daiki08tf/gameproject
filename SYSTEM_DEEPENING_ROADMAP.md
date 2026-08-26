# System Deepening Pack — Implementation Roadmap

> Status: **CURRENT**
>
> Purpose: deepen existing Blade Vale systems before Content Pack II. This is not a new numbered Phase and should not create a new parallel progression ladder.
>
> Source-of-truth parent: `ROADMAP.md`.

## Overall goals

1. Make existing choices matter more.
2. Make systems reinforce each other.
3. Make revisiting content meaningful.
4. Make discoveries feel diegetic rather than wiki-like.
5. Preserve compact mobile UX and save compatibility.
6. Prepare stronger foundations for Content Pack II.

## Non-goals

- no new level cap
- no new daily/weekly rotations
- no new mandatory currency
- no parallel Ranch/Codex/Adventure screens when existing surfaces can host the feature
- no Boss conditional Hidden Drop objectives in this pack
- no giant stat-inflation-only progression system

---

# Pack A — BUILD / COMBAT

## SD-1 — Unique / Relic Build Identity

### Problem

Loot can become a linear Item Power comparison if rare equipment does not change how the player plays.

### Goal

A strong Unique/Relic should answer:

> “What build or tactic does this item encourage?”

rather than only:

> “Is its number bigger?”

### Design vocabulary

Use existing combat concepts where possible:

- Break
- Guard
- Analysis
- element / weakness
- critical
- statuses
- Job resources
- Companion roles
- low/high HP
- phase transitions

### Effect model

Prefer reusable data-driven concepts such as:

- `trigger`
- `condition`
- `effect`
- `synergyTags`
- `tradeoff`

Do not hard-code every Unique directly into battle flow if a generic resolver is practical.

### Example identities

- Break weapon: lower neutral output, large Break-window payoff.
- Guard crown/shield: successful Guard builds temporary offensive momentum.
- Analysis relic: substantially better against analyzed/known targets, weaker general-purpose performance.
- Companion-support relic: buffs a specific party role rather than raw player damage.

### Acceptance

- representative Unique/Relic families have distinct build identity
- at least Break / Guard / Analysis are supported as reusable interaction hooks
- effects do not create obvious universal BiS
- Item Compare can summarize the identity without becoming a giant card
- existing saves remain valid
- tests cover trigger/condition resolution

---

## SD-2 — Job Synergy Deepening

### Problem

A mastered Job can become a completed checklist rather than an active build decision.

### Goal

MASTER should deepen identity without adding another Job-level treadmill.

### Direction

Strengthen existing MASTER/passive architecture with lateral synergies:

- weapon family
- Break timing
- Guard/protection
- Analysis/weakness exploitation
- element/status
- Companion role
- Job-specific resource behavior

### Example concepts

- sword-oriented MASTER: Break-window follow-up behavior
- guardian MASTER: protect/redirect interaction with Companion targeting
- magic/analysis MASTER: better exploitation of analyzed weaknesses
- hunter/tracker MASTER: modest rare-ecology utility rather than huge encounter-rate inflation

### Rules

- no new Job currency
- no second mastery bar
- Secret Jobs remain lateral/specialized, not strict replacements
- synergies should combine naturally with SD-1 equipment identities

### Acceptance

- MASTER choice can affect build/tactics after mastery
- several clear equipment + Job + Companion combinations emerge
- no Job becomes mandatory for general progression
- existing Job Codex/readability remains manageable

---

## SD-8 — Enemy Intent

### Problem

When enemy actions are too opaque, optimal play trends toward repeatedly pressing attack/heal rather than reading combat state.

### Goal

Give the player enough pre-action information to make a decision without exposing exact simulation data.

### Intent vocabulary

Core semantic classes may include:

- ATTACK
- GUARD
- CAST
- SUPPORT
- SUMMON
- DISRUPT
- DANGER

Normal enemies can use compact text. Bosses can use authored/lore-flavored telegraphs.

### Examples

Normal:
- “強力な単体攻撃を狙っている”
- “防御態勢へ移ろうとしている”
- “魔力を集中している”
- “仲間を呼ぼうとしている”

Boss:
- “王墓の剣が赤く染まる。”
- “観測眼がこちらの動きを記録している。”

### Important UX rule

Intent must not expand enemy cards so far that combat controls become inaccessible.

Use:
- compact one-line intent
- icons/tags only as supplemental identity
- bounded enemy list
- existing sticky command region

### Acceptance

- player can anticipate major tactical categories
- exact damage/AI internals remain hidden
- Boss telegraphs retain authored flavor
- permanent many-enemies/mobile regression test continues to pass

---

# Pack B — COLLECTION

## SD-3 — Companion Individuality

### Problem

Species/roles are meaningful, but two members of the same species can feel interchangeable.

### Goal

Create attachment and collection interest without introducing exhausting IV breeding.

### Layer 1: Personality

Small visible tradeoffs, e.g.:

- 獰猛: ATK↑ / DEF↓
- 慎重: DEF↑ / SPD↓
- 機敏: SPD↑ / HP↓
- 献身: support/heal↑ / personal damage↓

Exact numbers should remain modest.

### Layer 2: Rare Trait

Low-frequency modest traits such as:

- Break affinity
- fast learner
- treasure sense
- iron skin
- arcane sense

Rare Trait must be exciting but not required for viability.

### Layer 3: Epithet

Mostly prestige/flavor identity:

- uncommon epithets
- rare encounter/breeding provenance
- no mandatory stat benefit required

### Guardrail

A normal individual should remain completely usable. The system must not encourage hundreds of captures just to obtain acceptable stats.

### Acceptance

- individuality is visible in compact Ranch details
- search/filter remains usable at collection scale
- old companions lazily receive safe defaults
- breeding/recruitment still works without migration breakage

---

## SD-5 — Codex Field Guide

### Problem

A collection-only Codex has less gameplay value after an entry is seen.

### Goal

Turn the existing Codex into a knowledge progression / in-game field guide.

### Knowledge progression

Exact thresholds may vary, but the model is:

1. **Seen** — identity, unknown fields
2. **Observed** — rough HP/behavior class
3. **Studied** — weakness / resistance / Break tendency
4. **Known** — ordinary drop/habitat data
5. **Mastered** — rare ecological clue or advanced hint

Rare enemies can remain hidden until actually observed.

### Important rule

The Codex should provide useful information but should not simply print exact secret spawn formulas when discovery is intended to be mysterious.

### Cross-system links

Codex knowledge may connect to:

- Rumor Notebook
- Region Mastery
- Rare Hunt
- Treasure Maps
- Companion recruitment/ecology

### Acceptance

- kill/seen history drives knowledge reveal
- fields update automatically
- compact summary + progressive detail
- no separate “advanced Codex” screen

---

## SD-11 — Rare Encounter Presentation

### Problem

A 0.2% encounter does not feel special if it appears exactly like an ordinary wave.

### Goal

Make rare discovery emotionally legible through text presentation.

### Presentation pattern

Short, skippable/fast text sequence:

> 周囲の音が消えた。
>
> 魔物たちが姿を消す。
>
> 何かがこちらを見ている。
>
> **RARE ENCOUNTER**

Not every species needs the same wording. Prefer ecology-specific authored variants where practical.

### On discovery/result

- clearly mark first observation
- feed the Codex
- progress matching Rumor Notebook entry
- preserve normal reward systems

### Acceptance

- rare encounter feels distinct
- presentation remains fast on repeated encounters
- enemy-list height/commands remain safe

---

# Pack C — EXPLORATION INTELLIGENCE

## SD-6 — Rumor Notebook

### Role

This is the central navigation/knowledge feature of Pack C.

The player should naturally accumulate rumors without maintaining external notes.

### Persistence model

Prefer extending/reusing existing World 2 discovery/rumor records or a tightly attached lazy subrecord. Avoid an unrelated top-level lore database if possible.

A rumor needs at minimum:

- stable id
- title / short rumor text
- source/provenance when useful
- state
- optional related region/site once known
- clue progression
- resolution information

### States

Recommended semantic states:

- `unresolved`
- `tracking` / `clued`
- `resolved`

The exact internal values can follow existing conventions.

### Automatic sources

Rumors can be created/updated by:

- World Events
- NPC/event outcomes
- Lore Fragments
- region discoveries
- Secret Realm clears/discovery
- rare encounter discovery
- Codex knowledge thresholds
- Treasure Map/clue item acquisition

### UI

Do not add a Home button.

Place a compact entry inside an existing Adventure/World/Codex-adjacent surface, e.g.:

`RUMORS 12/38`

Notebook presentation:

- 未解決
- 追跡中
- 解決済み

Use compact rows → detail disclosure.

### Writing standard

Rumors are diegetic clues.

Bad:
- “黒月神殿3Fに0.3%でECLIPSEが出る”

Good:
- “月の光が最も弱い場所で、白い影を見た者がいる。”

### Resolution

Once the player genuinely discovers the subject, the notebook may reveal the actual identity and record how the rumor was resolved.

### Acceptance

- rumors automatically accumulate
- state advances through gameplay
- old Phase 12 rumors appear in the notebook where compatible
- no manual note-taking required
- unresolved secrets are not spoiled
- no new Home route

---

## SD-7 — Region Mastery Benefits

### Goal

Make region mastery feel like local knowledge rather than only a checklist.

### Small-benefit candidates

- tiny relative rare encounter bonus
- additional Rumor Notebook clue wording
- modest local recruitment bonus
- stronger treasure/secret clue precision

### Balance rule

Benefits are convenience/knowledge rewards. They should not make region mastery mandatory before engaging with content.

Example: a +5% **relative** rare modifier means 1.00% → ~1.05%, not 6.00%.

### Acceptance

- existing mastery completion is not revoked
- benefits are small/readable
- no new mastery currency/level ladder

---

## SD-10 — Treasure Maps / Clue Items

### Goal

Turn item text into exploration gameplay.

### Types

- torn map
- coordinate fragment
- damaged survey note
- encoded route
- symbolic drawing/description

### Example

> 黒い塔の西。三本の骨柱が交わる場所。

The game can know the target precisely; the player-facing text should remain interpretive.

### Outcomes

Use existing rewards where possible:

- Gold/materials
- equipment
- Lore
- rumor progression
- companion-related reward
- another clue/map
- secret discovery

### Chains

Multi-step map chains are allowed when each step gives enough information to continue.

### Acceptance

- clue item automatically connects to Rumor Notebook/Adventure when appropriate
- no map currency
- no mandatory external note-taking
- existing exploration route handles destinations

---

## SD-9 — Secret Chains

### Goal

Make discoveries connect across locations and create reasons to revisit older optional areas.

### Canonical pattern

Example only:

**古王墓の石板**
→ **反転図書館で解読**
→ **竜骸峡谷の座標**
→ **Hidden route / encounter / secret**

### Design requirements

- each step changes an existing exploration/discovery state
- clues should be understandable in-game
- avoid pure “visit every dungeon in arbitrary order” checklists
- main-story completion cannot depend on long secret chains
- secret chains may deepen The Veil/external-observer mystery without answering the main reveal early

### Acceptance

- at least one representative multi-location chain validates the architecture before Content Pack II
- existing dungeons gain revisiting value
- Rumor Notebook shows useful progress without giving away the next exact action

---

# Deferred — SD-4 Boss Conditional Hidden Drops

Owner decision: **do not implement now**.

Potential future home: Boss Deepening Pack.

Until explicitly re-enabled:

- do not add timed-kill Hidden Drop requirements
- do not add no-death/Break-finisher special drops
- do not hide equivalent mechanics inside Content Pack II

Existing ordinary/rare/hidden loot behavior is unaffected.

---

# Cross-pack gameplay loop target

The finished System Deepening Pack should enable loops like:

```text
World Event / Lore
      ↓
Rumor automatically enters Notebook
      ↓
Region / Codex knowledge narrows the clue
      ↓
Explore / revisit location
      ↓
Rare encounter / clue item / Secret
      ↓
Companion / Unique / Relic / Codex discovery
      ↓
Job + equipment build changes
      ↓
Try harder content / revisit another lead
      ↺
```

This loop is the foundation for Content Pack II.

---

# Implementation batching

Preferred PR batches:

## Batch A1
- SD-1 reusable Unique/Relic interaction hooks
- representative converted items
- tests

## Batch A2
- SD-2 Job synergies
- integrate with A1 tags/hooks
- tests

## Batch A3
- SD-8 Enemy Intent
- normal + Boss telegraphs
- permanent battle-command mobile regression

Then merge Pack A status.

## Batch B1
- SD-3 Companion individuality data/runtime/save defaults

## Batch B2
- SD-5 Codex knowledge ladder
- SD-11 Rare encounter presentation

Then merge Pack B status.

## Batch C1
- SD-6 Rumor Notebook data/runtime/UI
- migrate/bridge existing Phase 12 rumors

## Batch C2
- SD-7 Region Mastery benefits
- SD-10 Treasure Map/clue framework

## Batch C3
- SD-9 representative Secret Chain
- final cross-system integration/audit

Then mark System Deepening complete and begin Content Pack II.

Large batches may be combined when the shared architecture makes that safer.

---

# Completion gate

System Deepening Pack is complete when:

- Unique/Relic identities support real build decisions
- MASTER Jobs create lateral tactical synergies
- enemies communicate actionable intent
- companions have light, non-punishing individuality
- Codex works as a field guide
- rare encounters feel special
- Rumor Notebook automatically accumulates and resolves clues
- Region Mastery grants small local knowledge/convenience benefits
- Treasure Maps/clue items use textual exploration
- at least one multi-location Secret Chain works end-to-end
- no SD-4 conditional Boss Hidden Drop feature was added
- no rotating challenge feature was added
- mobile battle commands remain reachable under maximum enemy pressure
- save compatibility and CI pass

## Handoff line

**Current target: implement Pack A first (SD-1 → SD-2 → SD-8). After that Pack B (SD-3 → SD-5 → SD-11), then Pack C centered on automatic Rumor Notebook (SD-6 → SD-7 → SD-10 → SD-9). SD-4 is deferred.**
