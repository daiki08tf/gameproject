# System Deepening Pack — Implementation Roadmap

> **Status: CURRENT — Pack A ✅ COMPLETE / Pack B NEXT**
>
> Purpose: deepen existing Blade Vale systems before Content Pack II. This is not a new numbered Phase and must not create a parallel progression ladder.
>
> Parent source of truth: `ROADMAP.md`.

## Current handoff

**Completed:** SD-1 Unique/Relic Build Identity, SD-2 Job Synergy Deepening, SD-8 Enemy Intent.

**Next implementation batch:** Pack B — SD-3 Companion Individuality → SD-5 Codex Field Guide → SD-11 Rare Encounter Presentation.

**After Pack B:** Pack C — SD-6 automatic Rumor Notebook → SD-7 Region Mastery Benefits → SD-10 Treasure Maps / Clue Items → SD-9 Secret Chains.

**Deferred:** SD-4 Boss conditional Hidden Drops. Do not implement unless explicitly re-enabled.

## Permanent rules

- no new level cap
- no daily/weekly rotating challenges
- no new mandatory currency
- reuse existing Ranch / Codex / Adventure / World / Equipment / Job surfaces
- no new Home button when an existing grouped destination works
- no giant stat-inflation-only progression layer
- preserve old saves through lazy/default-safe data
- mobile battle commands must remain reachable regardless of enemy count/log length
- hints should guide without turning the game into an exact-spawn-rate wiki

---

# Pack A — BUILD / COMBAT ✅ COMPLETE

## SD-1 — Unique / Relic Build Identity ✅

Implemented a reusable lateral identity vocabulary using existing combat concepts rather than another equipment tier.

Representative live identities:

- **始祖竜骸刃 — BREAK / 竜骸破断**
  - stronger during a real depleted Break window
  - slight neutral-damage tradeoff outside Break
- **無名王冠 — GUARD / 王墓の反勢**
  - strengthens the next normal attack after Guard
- **反転目録・未刊 — ANALYSIS / 既知反転**
  - stronger against analyzed enemies
  - slight tradeoff against unknown targets

Implementation:
- shared data vocabulary in `js/data/systemDeepeningPackA.js`
- runtime uses existing Equipment / BattleEngine / Codex state
- no new save root or equipment rarity
- compact BUILD identity is surfaced inside the existing Equipment UI

Future Content Pack items should prefer these reusable tags/hooks or deliberately add another reusable identity rather than one-off hard-coded combat branches.

## SD-2 — Job Synergy Deepening ✅

Existing Job 3.0 Specialization / MASTER architecture remains authoritative. No second mastery bar was added.

Representative live links:

- **剣聖 MASTER → BREAK** — extra damage during Break
- **護剣 MASTER → GUARD** — extra damage on the post-Guard normal attack
- **秘術師 MASTER → ANALYSIS** — extra damage against analyzed enemies

Important behavior:
- synergy requires the **currently active route to be MASTERed**
- existing inherited MASTER/Legacy systems remain intact
- equipment and Job bonuses share the same build vocabulary, so combinations reinforce each other without becoming a new progression layer

## SD-8 — Enemy Intent ✅

Combat3 normal-enemy tactical skill rolls are now reserved before the action resolves. The UI reads that same reservation, preventing a misleading “telegraphed skill” followed by an unrelated fresh random roll.

Intent vocabulary includes:

- ATTACK
- GUARD
- CAST
- SUPPORT
- DISRUPT
- DANGER

Bosses reuse existing `pendingSpecial`, phase and encounter information for authored/tactical warnings.

UI contract:
- one compact intent line **inside** each existing enemy card
- no separate intent panel
- ellipsis/short-height compaction
- existing bounded enemy-list scroller remains authoritative
- sticky command grid / 44px tap target / attack-button regression contract remains unchanged

Validation on initial Pack A head:
- Blade Vale Tests #529 ✅
- Phase 8 Validation #120 ✅

---

# Pack B — COLLECTION ⏭ NEXT

## SD-3 — Companion Individuality

### Goal

Make two members of the same species feel slightly different without creating an IV-grind where normal recruits are inferior or disposable.

### Layer 1 — Personality

Small, visible tradeoffs. Candidate vocabulary:

- **獰猛** — ATK↑ / DEF↓
- **慎重** — DEF↑ / SPD↓
- **機敏** — SPD↑ / HP↓
- **献身** — support/heal↑ / personal damage↓

Exact values should remain modest.

### Layer 2 — Rare Trait

Low-frequency traits with modest effects, e.g. Break affinity, Fast Learner, Treasure Sense, Iron Skin, Arcane Sense.

A Rare Trait should be exciting but never required for viability.

### Layer 3 — Epithet

Flavor/prestige identity such as rare epithets or provenance. It may be cosmetic only.

### Requirements

- old companions receive safe defaults lazily
- recruitment/breeding save compatibility remains intact
- compact Ranch UI remains usable at collection scale
- normal individuals remain fully viable
- no hundreds-of-captures optimization loop

---

## SD-5 — Codex Field Guide

### Goal

Turn the existing Monster Codex from a static collection list into an in-game knowledge progression system.

Recommended semantic ladder:

1. **Seen** — identity; most information unknown
2. **Observed** — rough HP / behavior category
3. **Studied** — weakness / resistance / Break tendency
4. **Known** — ordinary drops / habitat information
5. **Mastered** — rare ecological clue / advanced hint

Exact kill thresholds may vary by enemy class.

### Cross-system links

Codex knowledge should be able to inform:
- Rumor Notebook
- Region Mastery
- Rare Hunt
- Treasure Maps
- Companion recruitment/ecology

### Rules

- rare enemies may remain completely hidden until first observation
- fields update automatically from existing seen/kill/analyzed data
- do not print exact secret spawn formulas where mystery is intended
- no second “advanced Codex” screen

---

## SD-11 — Rare Encounter Presentation

### Goal

A 0.2% encounter should feel meaningfully different from an ordinary wave.

Preferred pattern: short ecology-flavored text, then a clear `RARE ENCOUNTER` identity. First observation should feed Codex and, later, the Rumor Notebook.

Example tone:

> 周囲の音が消えた。  
> 魔物たちが姿を消す。  
> 何かがこちらを見ている。  
> **RARE ENCOUNTER**

### Requirements

- presentation is short and fast on repeat encounters
- different ecologies may use authored variants
- existing rewards/drop rules remain authoritative
- presentation cannot expand battle layout enough to threaten command reachability

### Pack B completion gate

Pack B is complete when:
- companion individuality works end-to-end with old-save defaults
- normal companions remain viable
- Codex knowledge progresses automatically
- rare encounters have distinct first/repeat presentation
- Codex/Ranch remain compact on mobile
- CI and permanent battle-command regression pass

---

# Pack C — EXPLORATION INTELLIGENCE

## SD-6 — Rumor Notebook — CENTRAL FEATURE

The player should automatically accumulate useful rumors without maintaining external notes.

### Persistence

Prefer extending/reusing existing World 2 discovery/rumor records or a tightly attached lazy subrecord. Avoid a second unrelated lore database.

A rumor should have:
- stable id
- title / diegetic rumor text
- source/provenance when useful
- state
- optional related region/site once known
- clue progression
- resolution information

### States

- `unresolved`
- `tracking` / `clued`
- `resolved`

### Automatic sources

- World Events
- NPC/event outcomes
- Lore Fragments
- region discoveries
- Secret Realm discovery/clear
- rare encounter observation
- Codex knowledge thresholds
- Treasure Map / clue acquisition

### UI

No Home button. Use an existing Adventure / World / Codex-adjacent surface with a compact entry such as:

`RUMORS 12/38`

Notebook filters:
- 未解決
- 追跡中
- 解決済み

Rows stay compact; details use progressive disclosure.

### Writing standard

Bad:
> 黒月神殿3Fに0.3%でECLIPSEが出る。

Good:
> 月の光が最も弱い場所で、白い影を見た者がいる。

Once genuinely discovered, the notebook may reveal the real identity and resolution.

Existing compatible Phase12 rumors must bridge automatically into the notebook.

---

## SD-7 — Region Mastery Benefits

Region Mastery should represent local knowledge rather than only a checklist.

Candidate small benefits:
- tiny **relative** rare encounter bonus
- additional wording for unresolved rumor hints
- modest local recruitment knowledge bonus
- slightly clearer treasure/secret clues

Example: +5% relative means 1.00% → ~1.05%, **not** 6.00%.

Existing mastery completion cannot be revoked and unfinished mastery must not feel punitive.

---

## SD-10 — Treasure Maps / Clue Items

Textual items become exploration gameplay:
- torn maps
- coordinate fragments
- damaged survey notes
- encoded routes
- symbolic directions

Example:
> 黒い塔の西。三本の骨柱が交わる場所。

The game may know the exact destination; player-facing text should remain interpretive.

Rewards should reuse existing systems where practical: Gold/material/equipment/Lore/Rumor/Companion-related rewards/another clue/Secret discovery.

No treasure-map currency.

---

## SD-9 — Secret Chains

Connect discoveries across existing locations to create meaningful revisits.

Representative architecture target:

**古王墓の石板 → 反転図書館で解読 → 竜骸峡谷の座標 → Hidden route / encounter / secret**

Requirements:
- each step changes existing exploration/discovery state
- clues are understandable in-game
- no arbitrary checklist chain
- never mandatory for main-story completion
- may deepen The Veil / outside-observer mystery without prematurely answering the central reveal

At least one representative multi-location chain must work end-to-end before Content Pack II begins.

---

# SD-4 — DEFERRED ⛔

Boss conditional Hidden Drop objectives are deliberately postponed.

Until explicitly re-enabled:
- no timed-kill Hidden Drop requirements
- no no-death / Break-finisher special drop conditions
- do not hide equivalent mechanics inside Content Pack II

Existing ordinary/rare/hidden loot behavior remains unchanged.

---

# Target cross-system loop

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

This loop becomes the foundation for Content Pack II.

# Implementation order

```text
Pack A ✅
  SD-1 → SD-2 → SD-8
      ↓
Pack B ← NEXT
  SD-3 → SD-5 → SD-11
      ↓
Pack C
  SD-6 → SD-7 → SD-10 → SD-9
      ↓
SYSTEM DEEPENING COMPLETE
      ↓
CONTENT PACK II
```

Large coherent batches are preferred when shared architecture makes them safer.

# Final completion gate

System Deepening is complete when:
- Unique/Relic identities create real build choices
- MASTER Jobs provide lateral tactical synergies
- Enemy Intent is actionable and truthful
- companions have light non-punishing individuality
- Codex works as a field guide
- rare encounters feel special
- Rumor Notebook automatically accumulates/resolves clues
- Region Mastery gives small local knowledge/convenience benefits
- Treasure Maps use textual exploration
- at least one multi-location Secret Chain works end-to-end
- SD-4 remains absent
- rotating challenges remain absent
- battle commands remain reachable under maximum enemy pressure
- save compatibility and both CI workflows pass
