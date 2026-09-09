# Blade Vale — Living World & Discovery Roadmap

> **Status:** Adopted / implementation pending
>
> **Theme:** **Living World & Discovery**
>
> This roadmap is the next-era direction after the current Stage-first, Gear, Enemy, Story, Settlement and Observed Branches foundations. It is intentionally a **convergence roadmap**: simplify abstractions that are not earning their complexity, then make Town / Rumor / Region / Codex / Ranch / Loot / Endgame talk to each other more strongly.

## 0. Non-negotiable design laws

1. **Stage-first remains canonical.** Home → Adventure → Chapter → Stage → Story / Hunt stays the primary story/combat route.
2. **Do not create parallel progression authority without explicit approval.** Reuse existing Adventure, Settlement, Codex, Ranch, Equipment, Job, Rune, Secret Realm, World Tier and reward authorities.
3. **No new currency just to justify a feature.** Fishing, Archaeology, Treasure Hunt and Companion growth must work without dedicated spendable currencies unless a later design proves one is necessary.
4. **No FOMO / real-time expiry.** Rumors, incidents, fish, secrets and discoveries can depend on world state or player actions, but not on “log in tonight or miss it”.
5. **Optional horizontal systems do not gate Ch1–30.** They enrich exploration, builds, collection and secrets.
6. **Prefer systems talking to each other over isolated minigames.** New content should connect to at least 2–3 existing systems where practical.
7. **Simplification comes first.** Complexity reclaimed from weak abstractions is deliberately spent on a more expressive world, not immediately replaced with another universal taxonomy.
8. **No Single Correct Build remains.** Counterplay and build identity can be efficient, while raw investment can still brute-force most soft checks.
9. **Mobile-first interaction.** New active interactions must remain readable and usable on compact screens; no twitch input requirement.
10. **Preserve save value.** Any Job / Companion / BREAK-family migration must explicitly preserve useful legacy progress.

---

# Phase overview

| Phase | Name | Core outcome |
|---|---|---|
| C0 | Simplification Audit | Remove BREAK / GUARD / ANALYSIS as universal systems; audit Job overlap and migration risk |
| C1 | Job Identity Rework | Keep Jobs that genuinely change the tactical loop; consolidate stat-only overlap |
| C2 | Living Settlement / Rumor 3.0 | Make Town a living inter-run hub and Rumor the connective tissue of discovery |
| C3 | Fishing | Regional / conditional fish, Codex, master fish and Rumor-linked active fishing |
| C4 | Archaeology | Ruins, tablets, artifact reconstruction, Lore and Secret discovery |
| C5 | Treasure Hunt 2.0 | Multi-step maps, clues, Rumor, Codex and Region exploration |
| C6 | Companion / Ranch Rework | Automatic recruitment + duplicate-species progression + meaningful collection identity |
| C7 | Settlement Incidents | Persistent world incidents distinct from Rumor information |
| C8 | Region Identity 2.0 | Regions become coherent ecology / discovery / loot bundles |
| C9 | Codex 3.0 / Field Research | Codex becomes progressive world knowledge rather than a passive list |
| C10 | Hidden Discovery / Secret 2.0 | More discoverable hidden bosses, places, companions, gear and routes |
| C11 | Boss Identity 2.0 | Bosses become targets to investigate, pursue, understand and re-fight |
| C12 | Nemesis 4.0 / Rival System | Nemeses become persistent actors in Town / Region / Rumor / Incident loops |
| C13 | Build Identity 2.0 | Emergent concrete builds without replacing BREAK/GUARD/ANALYSIS with another triad |
| C14 | Endgame Purpose Rework | Give each existing endgame mode a clear farming / testing purpose |
| C15 | Observed Branches Wave II | Add a few dense Branches that use the full discovery stack |
| C16 | Story Expansion III | Let the next story arc consume and reward the now-connected world systems |

---

# C0 — Simplification Audit

## Goal

Remove systems that are currently adding terminology or routing complexity without producing enough meaningful play.

## Locked decision

**BREAK / GUARD / ANALYSIS are planned for deprecation as universal build/combat axes.**

Do **not** replace them with another three-way classification.

Useful concrete behavior may survive as ordinary effects:

- stagger / interrupt / posture damage as specific skill or enemy behavior;
- block / counter / mitigation as specific defensive behavior;
- weakness knowledge / observation as Codex or field-research information.

## Audit scope

Before deletion, inventory every dependency across:

- Combat and battle effects
- Jobs / skills / mastery
- Runes
- Equipment Options / Unique effects
- Enemy behavior and Codex text
- UI labels and help text
- Save/import/migration code
- Tests and content data

Also build a **Job overlap matrix**:

- What does this Job make the player do differently?
- Is that difference tactical, or merely a stat multiplier?
- Could its best idea live more naturally in Mastery, Rune, Unique, skill or Option design?
- Does removing/merging it destroy an existing save investment?

## Acceptance

- No stale BREAK / GUARD / ANALYSIS terminology remains in live UX after migration.
- No replacement universal triad is introduced.
- Existing saves load safely.
- Valuable specific mechanics are migrated deliberately rather than silently deleted.
- Job overlap findings are documented before C1 implementation.

---

# C1 — Job Identity Rework

## Goal

A Job should exist because it changes **how the player fights**, not because it owns a slightly different percentage bonus.

## Direction

Use roughly **8–12 strong Jobs only if their identities justify the count**. This is a target range, not a quota.

Examples of valid identity differences:

- continuous offense that rewards maintaining pressure;
- parry / counter timing;
- HP-risk burst play;
- summon / companion-command play;
- resource cycling;
- status stacking and detonation;
- defensive conversion into offense.

Stat-only concepts can be folded into:

- Job Mastery
- Rune effects
- Unique / Named equipment
- skill choices
- random Options where appropriate

## Acceptance

- Every retained Job has a one-sentence tactical identity.
- No Job exists solely because of a stronger generic ATK/CRIT/BREAK-style modifier.
- Legacy Job progress has an explicit migration rule.
- Job count is determined by identity quality, not preservation for its own sake.

---

# C2 — Living Settlement / Rumor 3.0

## Goal

Turn Settlement from a facility menu into the place where the player **feels the world changing between adventures**.

## Core loop

```text
Return from Adventure
  ↓
Town / residents / atmosphere has changed
  ↓
Hear, notice or infer a Rumor
  ↓
Choose what seems interesting
  ↓
Adventure / Fishing / Archaeology / Treasure / Codex investigation
  ↓
Discover something
  ↓
Return to Town
  ↓
Resident dialogue / Incident / Rumor state changes
  ↺
```

## Rumor 3.0 rules

Rumor is **not an MMO quest board**.

Avoid:

- generic `!` task lists;
- “kill 5 enemies” filler;
- mandatory acceptance screens;
- real-time expiry.

Rumors may be:

- true;
- partly true;
- mistaken;
- one of several viewpoints on the same event;
- a weak clue that only becomes meaningful after another discovery.

A Rumor can originate from:

- Tavern conversation
- resident behavior
- guard / merchant / fisher / traveler reports
- recovered objects
- Codex observations
- Nemesis activity
- Settlement Incident aftermath
- Fishing / Archaeology / Treasure discoveries

## Acceptance

- Returning to Settlement can reveal authored world changes without creating a parallel story authority.
- Rumor has visible sources and world context, not only notebook entries.
- Rumor can progress through discovery and return-to-town feedback.
- No real-time missable Rumor design.

---

# C3 — Fishing

## Goal

Add a substantial non-combat collection and discovery activity that creates reasons to revisit regions.

## Core design

- regional fish identity;
- conditional fish tied to world/player state rather than real-world clock FOMO;
- Fish entries inside existing Codex surfaces;
- Rumor hints for unusual catches;
- hidden fishing spots;
- named **master fish / ヌシ** as long-term collection targets;
- fish can connect to existing materials, residents, discoveries and secrets without a new fishing currency.

## Interaction

Use a compact active text interaction rather than an idle timer.

Example command family:

- 合わせる
- 待つ
- 糸を緩める

Master fish can have authored pull patterns, feints or deep dives, but interaction must remain turn-based and mobile-friendly rather than twitch-precision gameplay.

## Acceptance

- No dedicated fishing currency.
- No real-world schedule/FOMO requirement.
- Fishing has meaningful Region identity.
- At least some fish connect to Rumor / Codex / Secret / resident content.
- Master fish are collection end-goals, not mandatory story gates.

---

# C4 — Archaeology

## Goal

Make ancient world evidence something the player **finds and reconstructs**, not only exposition delivered by story text.

## Content forms

- ruins;
- tablets;
- artifact fragments;
- broken machines;
- inscriptions;
- buried structures;
- reconstructed records.

## Connections

Archaeology should feed:

- World Lore
- Codex / Field Research
- Rumor reinterpretation
- Treasure Hunt clues
- Secret Realm / Hidden Discovery
- selected ancient rewards through existing reward/equipment authority

The useful intent behind ANALYSIS belongs here and in Codex: **knowledge changes what the player can infer about the world**, rather than existing as a generic battle build axis.

---

# C5 — Treasure Hunt 2.0

## Goal

Upgrade Treasure Maps from “obtain map → collect chest” into compact investigation chains.

## Possible chain

```text
Rumor
  ↓
Map fragment / strange clue
  ↓
Region knowledge
  ↓
Codex or Archaeology interpretation
  ↓
Specific exploration action
  ↓
Hidden location
  ↓
Treasure / Rare / Secret / Unique / Lore
```

Use existing reward authorities. No Treasure currency or separate Treasure level.

---

# C6 — Companion / Ranch Rework

## Goal

Make monsters a **second long-term collection axis** beside equipment without turning Ranch into a disconnected monster-collector game.

The main progression becomes:

```text
Monster recruitment proc
  ↓
AUTO JOIN
  ↓
First of species? → species becomes owned
Duplicate species? → species progression increases
  ↓
Species grade rises deterministically
  ↓
Traits / role / discovery expression expands
  ↓
Keep encountering the species with a reason
```

## C6-0 — Authority and migration audit

Before changing behavior, audit:

- current recruitment proc and prompt flow;
- current individual rarity roll;
- Nature / Talent / Mutation;
- breeding and eggs;
- active companion selection;
- Ranch `recruited` / species counters;
- special / secret companions;
- save/import format and legacy companion instances.

**Ranch remains the canonical companion progression authority.**

Codex remains the canonical ecology / knowledge authority.

Do not create a new companion currency or top-level save root.

## C6-1 — Automatic recruitment

Remove the current “仲間になりたそうにしている” accept/decline interruption.

When the existing recruitment chance succeeds:

- the monster joins automatically;
- battle flow is not blocked by a modal decision;
- show only a compact result notification.

Example first acquisition:

`[Companion] 灰狼が仲間になった`

There is no tactical reason to reject a successful recruit if duplicates are useful progression.

## C6-2 — Species ownership instead of duplicate roster clutter

The Ranch should present one canonical collection/progression identity per species rather than filling the roster with meaningless copies of the same monster.

- First successful recruitment establishes ownership of that species.
- Further successful recruitment of the same species feeds that species' progress.
- Active companion use may still reference a concrete representative / existing companion data where needed for compatibility, but duplicate acquisition should not force endless manual cleanup.

## C6-3 — Duplicate recruit → species progression

Same-species recruitment increases a persistent species progression value.

Preferred authority:

- reuse / extend the existing Ranch recruited-count concept;
- if UI says `種族EXP`, treat it as a **derived display of recruit progress**, not a spendable currency;
- avoid a second XP wallet or new economy.

Example duplicate notification:

`[Companion] 灰狼 +1 種族EXP`

Exact thresholds are intentionally **data-driven and tuning-owned**, not locked by this roadmap.

## C6-4 — Deterministic species grade

Repurpose the existing companion rarity vocabulary as a persistent species grade:

`Normal → Rare → Epic → Legendary → Mythic`

Direction:

- rarity/grade is no longer primarily a lucky per-instance roll;
- repeated recruitment deterministically advances the species;
- every successful duplicate has visible value;
- the player should be able to see progress toward the next grade.

Example rank-up notification:

`[Companion] 灰狼が Epic に昇格`

## C6-5 — What grade should unlock

Avoid making grade only a giant flat-stat ladder. It should increasingly express what makes the species interesting.

Suggested structure:

| Grade | Direction |
|---|---|
| Normal | Base combat role / collection ownership |
| Rare | Species trait I |
| Epic | Species trait II or meaningful behavior evolution |
| Legendary | Discovery / Settlement / Rumor utility or distinctive combat interaction |
| Mythic | Signature capstone trait, special presentation/title and strongest species identity |

Raw power can rise, but the capstone should not become a universal mandatory “Mythic or useless” requirement.

## C6-6 — Ranch collection UI

A species entry should make the long-term collection loop legible:

- owned / not owned;
- current grade;
- duplicate progress toward next grade;
- lifetime recruit count;
- known source / habitat when discovered;
- combat role;
- unlocked species traits;
- active status;
- breeding / special-breeding connections where relevant.

Do not add another top-level Home button.

## C6-7 — Legacy migration

Existing companion investment must not be devalued.

Migration principles:

- existing Ranch recruit counts contribute to species progress;
- existing duplicates contribute rather than disappear without compensation;
- highest legacy individual rarity should establish an appropriate **minimum** species grade so old lucky rolls are not downgraded;
- Nature / Talent / Mutation / breeding data must be audited and explicitly preserved, transformed or retired — never silently lost;
- secret/special companions need authored migration rules where generic species logic is insufficient.

## C6-8 — Discovery integration

Companions should interact with Living World & Discovery through identity-driven hints and reactions rather than mandatory flat bonuses.

Examples:

- scent/tracker species reacts to Treasure Hunt traces;
- aquatic/amphibious species notices Fishing clues or unusual water;
- ancient/ghost species reacts to Archaeology evidence;
- territorial species reacts to specific Region ecology;
- social/intelligent species changes Settlement/Rumor flavor.

These are reasons to care about collection breadth, not hard gates requiring one exact companion.

## C6-9 — After Mythic

Duplicates must remain non-useless after grade cap, but **do not create Mythic+ currency or infinite rarity tiers**.

Possible uses of lifetime recruitment inside existing systems:

- breeding depth;
- field-research completion;
- collection records;
- cosmetic/title milestones;
- authored species mastery records.

Final implementation choice belongs to the C6 audit; avoid another uncapped vertical power ladder by default.

## C6 acceptance gates

- Recruitment success auto-joins; no accept/decline prompt.
- Same-species duplicates do not create mandatory roster cleanup.
- Every duplicate advances visible species progress.
- Species grade progression is deterministic and inspectable.
- Normal → Rare → Epic → Legendary → Mythic remains understandable without random duplicate-instance rarity pressure.
- Existing saves retain meaningful rarity/recruit/breeding investment.
- No new spendable companion currency.
- No new save root / progression authority.
- Ranch remains companion progression authority; Codex remains ecology knowledge authority.

---

# C7 — Settlement Incidents

## Goal

Add actual **world events happening to the town and its surroundings**, distinct from Rumor as information about those events.

Examples:

- resident disappearance;
- Nemesis raid;
- caravan attack;
- Rift disturbance;
- monster intrusion;
- mysterious artifact arrival;
- strange Tavern incident.

Distinction:

- **Incident = something happening in the world**
- **Rumor = what people know, believe or say about it**

No real-time expiry. Ignored incidents may persist or transform through authored state changes instead of disappearing on a clock.

---

# C8 — Region Identity 2.0

## Goal

A Region should be a coherent gameplay/ecology identity, not only a different background and enemy table.

Each mature Region should aim to express a bundle such as:

- local ecology and enemy families;
- Rare encounter identity;
- Boss / hidden threat;
- fish and waterside identity where applicable;
- archaeology type;
- Rumor flavor;
- local materials / loot identity;
- Unique / Rune target where appropriate;
- Settlement relationship;
- lore / legend;
- hidden area / Secret hook.

A swamp should *play and discover* like a swamp, not simply be named one.

---

# C9 — Codex 3.0 / Field Research

## Goal

Move Codex from “things already found” toward **knowledge that develops through play**.

Example knowledge ladder:

```text
Unknown creature
  ↓ encounter
Name / rough description
  ↓ repeated encounter
Habitat / behavior
  ↓ Rumor / observation
Rare pattern / social behavior
  ↓ archaeology / special encounter
historical or ecological meaning
```

Codex knowledge may reveal or clarify:

- enemy weaknesses / behaviors;
- Rare encounter conditions;
- Fishing hints;
- Treasure hints;
- Archaeology interpretation;
- Secret clues;
- Rumor contradictions.

This is where the useful observational idea behind ANALYSIS should live after C0.

---

# C10 — Hidden Discovery / Secret 2.0

## Goal

Increase the amount of **discoverable hidden world content**, while keeping clues fair inside the game.

Possible targets:

- hidden Boss;
- hidden NPC;
- hidden fishing spot;
- hidden ruin;
- hidden weapon;
- hidden Companion;
- hidden Job where narratively justified;
- special Rune;
- alternate area/route;
- multi-Rumor secret chain.

Avoid opaque guide-only conditions. Rumor / Codex / Archaeology / Treasure clues should make secrets inferable.

---

# C11 — Boss Identity 2.0

## Goal

Make selected Bosses something the player **tracks and learns**, not only a stage endpoint.

Possible loop:

```text
Rumor / damage report
  ↓
Trace / ecology clue
  ↓
Codex hypothesis
  ↓
Pursuit / precursor encounter
  ↓
Boss discovery
  ↓
Boss battle
  ↓
Codex / Rumor / Town response
  ↓
Re-fight for authored hidden reward conditions
```

Revisit the previously deferred conditional Boss hidden-drop idea here, with readable in-game hints rather than external-guide dependency.

---

# C12 — Nemesis 4.0 / Rival System

## Goal

Turn Nemesis from a special enemy entry into a persistent actor whose actions can be felt across the living world.

Potential connections:

- sightings become Rumors;
- attacks become Settlement Incidents;
- travel changes Region state;
- failed pursuit can let a Nemesis reappear stronger or differently equipped;
- residents react to known Nemeses;
- defeat updates Codex / Rumor / Settlement state and existing Nemesis reward authority.

Do not create a new Nemesis currency or mandatory timer.

---

# C13 — Build Identity 2.0

## Goal

After BREAK / GUARD / ANALYSIS removal, let builds emerge from **concrete effects** instead of abstract universal labels.

Possible natural archetypes include:

- DoT;
- Critical;
- Counter;
- Summon / Companion;
- Low-HP risk;
- Shield / mitigation conversion;
- Sustain / lifesteal;
- Status stacking;
- basic-attack focus;
- cooldown cycling;
- resource burn / recovery;
- skill burst.

The player should be able to say “this became a poison build” because Job + Weapon + Option + Rune + Unique effects actually interact that way — not because the game assigned a new `POISON BUILD` progression meter.

---

# C14 — Endgame Purpose Rework

## Goal

Make existing endgame modes answer different player intentions before inventing another mode.

Direction example only; validate against live reward tables during C14:

| Existing content | Intended reason to visit |
|---|---|
| Branch Hunt | Region / Rune / local target farming |
| Secret Realm | Hidden / Unique rewards |
| Rift | unusual Option or specialized gear chase |
| Abyss | dense loot / growth materials |
| Deep Survey | build verification / demanding constraints |
| Nemesis | Rival-specific chase |
| Archaeology | ancient knowledge / authored ancient rewards |
| Treasure Hunt | hidden target rewards / rare finds |

Final mapping must reuse canonical reward authority and avoid duplicating the same generic loot purpose everywhere.

---

# C15 — Observed Branches Wave II

## Goal

Return to content expansion only after the new discovery stack exists.

Do **not** begin by creating ten shallow Branches. Start with a small number of dense Branches and prove the template.

A mature new Branch should aim to combine:

- distinctive Region identity;
- enemy ecology;
- Rare encounter;
- Boss + hidden threat;
- Fishing content where appropriate;
- Archaeology evidence;
- Treasure chain;
- Rumors / Incident hooks;
- Codex field research;
- Rune / Named / Unique chase;
- Secret content;
- at least one meaningful Companion connection;
- lore fragments that can later feed story.

---

# C16 — Story Expansion III

## Goal

Write the next major story expansion **after the world systems can carry it**.

Story should consume existing systems rather than create parallel progression:

- towns can react to story consequences;
- Rumors can foreshadow or contradict events;
- Archaeology can surface evidence;
- Codex can reinterpret known ecology;
- Branches can contain optional discoveries;
- Companions can react where authored;
- Boss/Nemesis/world incidents can make consequences playable.

The Story authority itself remains the existing canonical stage/chapter progression.

---

# Recommended implementation sequence

```text
C0 Simplification Audit
  ↓
C1 Job Identity Rework
  ↓
C2 Living Settlement / Rumor 3.0  ← living-world spine
  ↓
C3 Fishing
C4 Archaeology
C5 Treasure Hunt 2.0
C6 Companion / Ranch Rework
  ↓
C7 Settlement Incidents
C8 Region Identity 2.0
C9 Codex 3.0 / Field Research
C10 Hidden Discovery / Secret 2.0
  ↓
C11 Boss Identity 2.0
C12 Nemesis 4.0
C13 Build Identity 2.0
C14 Endgame Purpose Rework
  ↓
C15 Observed Branches Wave II
  ↓
C16 Story Expansion III
```

C3–C6 may be developed in bounded parallel slices after C2 establishes the shared Settlement/Rumor hooks, but each phase must close its authority/save/UI acceptance gates before broad content production.

---

# Target player loop after convergence

```text
Town changes
  ↓
Rumor / Incident / resident reaction
  ↓
Choose a lead
  ↓
Region
  ├─ Battle / Boss / Nemesis
  ├─ Fishing
  ├─ Archaeology
  ├─ Treasure Hunt
  ├─ Companion collection
  └─ Codex field research
  ↓
Discovery / Loot / Species growth / Secret
  ↓
Return to Town
  ↓
The world responds
  ↺
```

The purpose of this roadmap is not to make Blade Vale “a game with many minigames”. The purpose is to make the existing hack-and-slash foundation feel like **one world worth repeatedly exploring, collecting, investigating and fighting through**.