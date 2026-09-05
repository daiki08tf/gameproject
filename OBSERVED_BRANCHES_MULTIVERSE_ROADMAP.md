# Blade Vale — Observed Branches / Multiverse Roadmap

> Status: **M0–M4 COMPLETE (Story Expansion II / Arc V and Content Pack IV both closed out first, as this doc originally required). NEXT: M6 — second Branch of 深緑の森 (深緑消失域), then M9's first Branch Cluster pick (灼熱の火山), then M7 comparative records feeding directly into a new Arc VI opening chapter. See "Decision log" below.**
>
> Working system name: **Observed Branches / 観測分岐世界**
>
> Core rule: Blade Vale does not use an unrestricted infinite multiverse. **Only historically meaningful possibilities that were observed strongly enough to remain fixed can become stable Branch worlds.**

## Decision log

- **M0–M2** shipped exactly as this document specified: see `OBSERVED_BRANCHES_M0_AUDIT.md`, `OBSERVED_BRANCHES_M1_IMPLEMENTATION.md`, `OBSERVED_BRANCHES_M2_IMPLEMENTATION.md` (each self-marked `COMPLETE`).
- **M3–M4** shipped under the Core Loop Rework's own numbering instead of a dedicated `OBSERVED_BRANCHES_M3`/`M4` doc: see `CORE_LOOP_CLR21_IMPLEMENTATION.md` ("Observed Branches M3/M4 Rebase ✅ COMPLETE"), which made 王樹領・深緑の森 a playable Stage-first Branch under the existing `findStage()`/`stageProgress` authority. Only this one Branch exists today.
- **Reordering M5 and M6**: this doc originally sequenced M5 (broader gear expansion across whatever Branches exist so far) before M6 (the second, contrasting Branch). Decision: do **M6 before a dedicated M5 pass**. Rationale — M4 already shipped 王樹領 with its own initial equipment (the `ch2_weapon_epic` boss reward) the same way M6's vertical slice will ship 深緑消失域 with its own initial equipment; the document's own stated purpose for M6 ("prove Branches are not cosmetic skins, demonstrate technology regression/advancement contrast") is best served by both halves of Branch Cluster 1 existing before investing in a broader M5-style gear pass across them. M5 now follows M6 rather than preceding it.
- **M9 first pick**: 灼熱の火山 (Volcano) is the confirmed first new Prime Region for Branch Cluster expansion, ahead of Machine World and The Veil (both remain queued, order not yet decided).
- **Arc VI tie-in (new, not in the original doc)**: M7's comparative Codex/Chronicle record (Prime / 王樹領 / 深緑消失域, once both exist) becomes the direct narrative lead-in to a new Ch36 — the Arc VI opening chapter. The two branches' accumulated records (深緑消失域's Boundary/Information-heavy archive plus 王樹領's Bio/Arcane one) are the concrete "evidence" that lets Ch36 partially recover the "missing observation interval" named in `WORLD_LORE_BIBLE.md`'s open mysteries #8/#9, without answering the larger external-civilization mysteries (#1/#2) outright. This keeps the horizontal Observed Branches system feeding the vertical Story spine exactly as `WORLD_LORE_BIBLE.md`'s writing rules require ("give existing mechanics narrative meaning before inventing lore-only systems").

## Vision

Blade Vale already has world layers, The Veil, Secret Realms, observation, the Eighth Key, returned signals, World Tier states and alternate combat reconstruction.

Observed Branches extends those ideas from:

```text
same world / different layer
```

to:

```text
same origin / different history
```

The player revisits known Regions whose history diverged at one important branch point.

Example:

```text
通常世界
深緑の森
  ↓ branch point: 森の大樹霊を倒した

Observed Branch A
王樹領・深緑の森
  - 大樹霊が生存
  - 森全体が統治生態系へ進化
  - 生体技術 / 樹霊術が高度化

Observed Branch B
深緑消失域
  - 境界災害で森林圏が消失
  - 根の記憶だけが地形に残る
  - 生体技術は退化
  - 境界観測 / 残響技術が異常発達
```

The attraction is not simply “a different map”. The same familiar place must answer:

- What single historical event changed?
- Who survived or disappeared?
- What technology advanced because of that history?
- What knowledge or technology was never invented?
- How did enemies and ecology adapt?
- What equipment could exist only in that branch?

## Canon model

### World Layer is NOT a Branch World

Existing layers remain part of the same canonical world network:
- Human Realm
- Heaven
- Underworld
- Boundary Layer
- Machine World
- other existing Veil-linked layers

An Observed Branch is a different historical realization of that network.

### External Civilization is NOT automatically a Branch World

The external civilization introduced in Ch26–35 remains a distinct mystery.

Do not collapse these concepts into:

> external civilization = Earth = multiverse administrator

Instead preserve the stronger possibility:

```text
Blade Vale Prime
Observed Branch worlds
External Civilization
        ↓
all may themselves be observation subjects
```

The Eighth Key / shared-observation phenomenon may eventually explain why these histories can be compared, but does not need to be their creator.

## Multiverse rules

1. **No infinite-content excuse.** Branches are authored and finite.
2. A stable Branch requires a meaningful historical divergence and observation evidence.
3. Every Branch has one primary divergence point; secondary differences flow from it.
4. “Anything can happen somewhere” is not valid canon reasoning.
5. Existing Prime timeline remains authoritative for Story progression.
6. Branch content is horizontal by default and cannot retroactively gate Ch1–35.
7. Branch death/failure causes no permanent equipment or Companion loss.
8. No real-time rotation, FOMO branch, daily portal, branch energy, or multiverse currency.
9. Branches reuse Adventure / World / Secret Realm / Story / Gear / Codex / Settlement surfaces before adding top-level navigation.
10. World Tier remains **state pressure inside one history**; Observed Branches represent **different history**. Do not merge these concepts.

## Technology divergence model

Every Branch has an authored **Technology Profile**. “Technology” includes not only machines but every systematic way that civilization or ecology manipulates the world.

Recommended axes:

- **Mechanical / 機構技術** — machinery, automation, weapons, fabrication.
- **Arcane / 魔導技術** — spell systems, ritual engineering, magical computation.
- **Bio / 生体技術** — breeding, symbiosis, living armor, ecological control.
- **Boundary / 境界技術** — Veil routing, phase control, sealing, spatial manipulation.
- **Information / 観測技術** — Codex-like analysis, prediction, recording, signal processing.
- **Material / 素材技術** — metallurgy, crystal engineering, relic craft, primitive-but-exceptional materials.

A Branch does not simply receive a global “Tech Lv”. It gets a profile such as:

```text
王樹領・深緑の森
Mechanical   ↓↓
Arcane       ↑
Bio          ↑↑↑
Boundary     →
Information  ↓
Material     ↑

深緑消失域
Mechanical   →
Arcane       ↓
Bio          ↓↓↓
Boundary     ↑↑↑
Information  ↑↑
Material     ↑
```

This prevents “advanced branch = universally better gear”.

### Advancement and regression both matter

Technology regression is not automatically weakness.

Examples:
- a branch loses industrial machinery but develops unmatched rune-forging by hand,
- medicine regresses but symbiotic monsters replace it,
- information storage disappears but living memory becomes superior,
- long-range weapons never develop because phase-step combat dominates,
- magic declines and precise mechanical weaponry becomes dominant.

The result should create **different build logic**, not a linear power ladder.

## Branch Equipment philosophy

Observed Branch gear must reuse the existing Equipment / Gear Overhaul authorities.

Permanent Gear contracts remain:
- max 3 random Options,
- Option rarity unchanged,
- Option Lv1–100 unchanged,
- Item Power cap unchanged,
- Unique fixed identities stay separate from random Options,
- no new inventory,
- no branch currency,
- no new universal rarity above existing rarities.

### Branch Origin metadata

Equipment may carry read-only origin metadata:

```text
Origin: Observed Branch — 王樹領
Technology: Bio / Arcane
Divergence: 大樹霊生存
```

Origin is not a rarity or progression axis.

### Branch Fixed Identities

The strongest branch identity should live in existing FIXED / Unique identity space.

Examples:

**王樹脈剣・ヴェルダント**
- living weapon grown rather than forged
- repeated Guard / healing actions cause a temporary growth state
- strong sustain identity, not simply higher ATK

**無根刃・NULL ROOT**
- weapon from a world where the forest disappeared
- gains an effect when no regeneration/healing effect is active
- turns absence into build identity

**母機統制杖・ADMINISTRATOR-Σ**
- from a Machine-dominant branch
- rewards action sequencing / repeated technique analysis

**手打ち星鉄刀・無機暦**
- from a technologically regressed branch that never developed automation
- exceptional material craft, low system complexity, strong direct-hit identity

### Alternate versions of familiar items

Existing Named/Unique items may have authored **Branch Variants**, but these are separate item identities rather than automatic upgrades.

Example:

```text
Prime:
狼王の逆咬み

王樹領:
狼王の樹咬み
  - wolf lineage adapted into tree-symbiosis

深緑消失域:
狼王の残響牙
  - species extinct; weapon preserves only combat-memory echo
```

A Branch Variant must not invalidate the Prime version. Each should support a different loop.

## Rune integration

Rune 2.0 can express technological philosophies without a new socket system.

Examples:
- Bio Rune — reaction after healing, poison, bleed, companion interaction.
- Boundary Rune — phase/guard/position/first-action information.
- Machine Rune — sequence or repeated-action analysis.
- Primitive Material Rune — fewer conditions, stronger simple physical identity.
- Lost Arcane Rune — mana/skill pattern transformation.

Branch Runes remain existing Rune 2.0 entries and use existing ownership/crafting/drop rules.

## Option integration

Branch gear may bias existing Option families through canonical loot profiles.

Examples:
- 王樹領 → HP / sustain / Guard heal / poison / companion-adjacent families.
- 深緑消失域 → Crit / phase / CDR / anti-heal / anomaly-oriented families.
- Machine supremacy branch → CDR / MP / SPD / sequence-friendly families.
- low-tech warrior branch → ATK / DEF / Crit damage / guard / raw durability.

Do not create Branch-only Option levels or a second Option system.

## Enemy / ecology divergence

Branch enemies should reuse Enemy 2.0/3.0 foundations while changing authored ecology and behavior.

Possible transformations:
- same species, different role/evolution,
- extinct species replaced by ecological successor,
- former Boss becomes regional ruler,
- Prime ally becomes hostile authority,
- Prime enemy becomes guardian,
- Machine enemy replaced by biological analogue,
- lost magic creates mechanical counters,
- advanced magic makes armor technology obsolete.

Bosses should embody the branch point rather than merely be palette swaps.

## Nemesis integration

Existing Nemesis remains authoritative.

Future Branch extension may allow:

> a Nemesis carrying an imprint from another observed history.

Possible identity:
- **異史宿敵 / Branch Nemesis**

This must remain a derived Nemesis variant, not a second rival database.

High-value future idea:
- “the Nemesis that defeated the protagonist in another observed branch.”

Do not implement this until base Branch traversal is stable.

## Codex / Chronicle integration

Branch history should be recorded through existing Codex / Chronicle concepts.

Suggested record fields:
- Prime Region
- Branch name
- divergence point
- observed consequences
- technology profile
- altered species
- rulers / missing characters
- discovered Branch equipment
- unresolved contradictions

Unknown Branches must not expose their total count or secret identities.

## Navigation / access model

No new Home button.

Preferred flow:

```text
Settlement / Adventure
  ↓
World
  ↓
known Region
  ↓
Observation anomaly discovered
  ↓
[通常史]
[観測分岐: 王樹領]   ← only after discovery
[???]                ← preferably hidden rather than spoiled
```

A Branch is a variation of an existing Region context, not a separate top-level game mode.

## Initial authored Branch candidates

### Branch Cluster 1 — 深緑の森

#### Prime
**深緑の森**
- canonical Ch2 / current history.

#### A: 王樹領・深緑の森
Divergence:
- 森の大樹霊が倒されず、森の統治者として定着。

Consequences:
- villages retreat into canopy settlements,
- beast species develop plant symbiosis,
- metalworking declines locally,
- living construction and bio-arcane craft advance dramatically.

Technology:
- Bio ↑↑↑
- Arcane ↑↑
- Mechanical ↓↓
- Material ↑

Gear themes:
- living weapons,
- symbiotic armor,
- heal/guard/growth fixed identities,
- poison/root/companion-adjacent Rune identities.

Boss candidate:
- **王樹神体グラン・シルヴァ**

#### B: 深緑消失域
Divergence:
- early boundary collapse deletes the forest ecology before the canonical journey.

Consequences:
- species disappear,
- root-memory remains in the terrain,
- settlements develop observation instruments to navigate blank zones,
- ecological technology collapses while Boundary/Information technology accelerates.

Technology:
- Bio ↓↓↓
- Boundary ↑↑↑
- Information ↑↑
- Mechanical →

Gear themes:
- echo weapons,
- anti-regeneration identities,
- phase/observation gear,
- extinct-species memory relics.

Boss candidate:
- **根無き森核・NULL CANOPY**

### Branch Cluster 2 — 灼熱の火山

Potential Branch A:
- 炎帝ドレイクが勝利し、火山国家の神王となった history.
- heat metallurgy / draconic material technology evolves beyond Prime.

Potential Branch B:
- volcano extinguished centuries earlier.
- fire magic nearly disappears; pressure/steam/mechanical craft replaces it.

### Branch Cluster 3 — Machine World

Potential Branch A:
- MOTHER receives full emergency authority and completes total administration.
- Mechanical / Information technology extreme; individual improvisation suppressed.

Potential Branch B:
- Machine World collapses before MOTHER generation.
- repair traditions become manual ritual craft; low automation but strange artifact mastery.

### Branch Cluster 4 — The Veil

Potential Branch A:
- The Veil never fractures.
- internal worlds remain isolated, resulting in highly specialized local technologies.

Potential Branch B:
- The Veil collapses much earlier.
- mixed-law civilization develops boundary survival technology but loses stable regional identity.

## Story timing

Observed Branches should NOT fully activate during early Story Expansion II.

Recommended narrative sequence:

```text
Story Expansion II / Ch31–35
  ↓
prove shared observation + missing records
  ↓
Content Pack IV
  ↓
find contradictory records of familiar Regions
  ↓
first stable historical echo
  ↓
Observed Branches Phase M0–M4
  ↓
first traversable Branch cluster
```

Ch33–35 may foreshadow alternate histories without naming “multiverse”.

Suggested terminology ladder:
1. contradictory observation
2. impossible historical record
3. alternate outcome trace
4. observed divergence
5. **観測分岐世界 / Observed Branch**

## Implementation roadmap

### [x] M0 — Multiverse / authority audit

Audit:
- World 4 Region authority,
- Story / CHAPTERS authority,
- Secret Realm and Deep Survey routing,
- World Tier derived state,
- Discovery / Codex / Chronicle ownership,
- Equipment / Fixed Identity / Unique2 / Rune2 / Option4 extension points,
- Enemy 2/3 variant extension points,
- save/migration ownership.

Deliverable:
- `OBSERVED_BRANCHES_M0_AUDIT.md`.

### [x] M1 — Branch data model

Create authored, data-driven branch definitions:
- Prime Region reference,
- Branch ID/name,
- divergence point,
- historical summary,
- technology profile,
- ecology profile,
- route/scene references,
- discovery conditions.

No combat/reward logic in the branch definition.

### [x] M2 — Branch discovery / secrecy

Use existing Adventure investigation and Discovery authority.

Requirements:
- unknown Branch count hidden,
- no Branch menu before discovery,
- deterministic first discovery route,
- no rare/RNG gate for first required example.

### [x] M3 — Branch Region presentation

Extend existing Region context so a discovered Region may expose history variants.

Requirements:
- no new Home button,
- compact mobile selector,
- clear Prime vs Branch labels,
- World Tier continues to apply inside the selected history without becoming the history selector.

### [x] M4 — First Branch vertical slice: 王樹領

Implement `深緑の森 → 王樹領・深緑の森` end-to-end:
- authored route,
- scenes,
- ecology variants,
- altered NPC/world text,
- canonical battles,
- Branch Boss,
- Codex/Chronicle record,
- technology-profile presentation,
- initial Branch equipment.

This is the architecture proof before adding other Branches.

Shipped under `CORE_LOOP_CLR21_IMPLEMENTATION.md` rather than a dedicated M3/M4 doc — see the Decision log above.

### [ ] M5 — Divergent Technology Gear I

**Deferred until after M6** (see Decision log above) — do not start this before M6 ships.

Implement the first technology-origin equipment set through existing Gear authorities.

Targets:
- 4–6 Branch weapons,
- 4–6 armor/accessory identities,
- 3–5 Branch Runes,
- 2–3 Named/Unique fixed identities.

Rules:
- no new rarity,
- max-three Options preserved,
- no mandatory BiS,
- Branch Origin metadata display,
- technology changes mechanics/conditions rather than pure Item Power.

### [ ] M6 — Second Branch vertical slice: 深緑消失域 — **NEXT UP**

Use the same Prime Region but opposite historical consequence.

Purpose:
- prove Branches are not cosmetic skins,
- demonstrate technology regression/advancement contrast,
- create extinct-species / memory-echo ecology.

Design is already authored in full under "Initial authored Branch candidates → Branch Cluster 1 → B: 深緑消失域" above (divergence point, technology profile, gear themes, boss candidate 根無き森核・NULL CANOPY) — implementation should follow that, not re-derive it.

### [ ] M7 — Comparative Branch records

Codex/Chronicle can compare:
- Prime history,
- 王樹領,
- 消失域.

Do not expose undiscovered Branches.

Add “what changed?” compact summaries rather than long lore dumps.

**Arc VI tie-in (new — see Decision log above):** once M7's comparative record exists for all of Prime/王樹領/消失域, it becomes the direct narrative lead-in to a new Ch36, opening Arc VI. The two Branches' accumulated technology-profile archives (消失域's Boundary/Information-heavy record plus 王樹領's Bio/Arcane one) are what let Ch36 partially recover the "missing observation interval" from `WORLD_LORE_BIBLE.md` open mysteries #8/#9 — living/root/ash-adjacent media retain what machine records cannot — without resolving the larger external-civilization mysteries (#1/#2). Do not write Ch36 before M7's comparative record actually exists; the chapter's opening beat depends on the player having that record in hand.

### [ ] M8 — Branch Equipment II / familiar Unique variants

Add authored alternate identities for selected familiar Prime items.

Requirements:
- variants are separate items,
- Prime version remains useful,
- no automatic conversion,
- distinct combat loops,
- existing Unique2 balance envelopes respected.

### [ ] M9 — Branch Cluster expansion

Add 2–3 more Prime Regions with at least one Branch each.

Preferred early clusters:
- **灼熱の火山 — confirmed first pick (see Decision log above).**
- Machine World,
- The Veil.

Content must remain data-driven.

### [ ] M10 — Enemy/Nemesis Branch integration

Deepen divergent ecology with Enemy 2/3 roles and authored Boss behavior.

Optional pilot:
- one Branch-derived Nemesis modifier using existing Nemesis ownership.

No second Nemesis save root.

### [ ] M11 — Endgame Branch chase

Connect Branches to existing loot/endgame loop:

```text
Branch discovery
 → branch route / boss
 → technology-origin gear
 → Option/Unique refinement
 → higher World Tier / Deep Survey / Branch challenge
```

No branch tokens, portal keys-as-currency, weekly resets or parallel Item Power.

### [ ] M12 — Observed Branches completion audit

Cross-check:
- Prime Story unchanged,
- endgame gates unchanged,
- World Tier role distinct,
- Secret Realm role distinct,
- no duplicate Discovery/Codex/Chronicle ownership,
- no duplicate Gear/Option authority,
- no hidden Branch spoiler counts,
- mobile navigation safe,
- save compatibility,
- required CI green.

## Long-term content targets

Do not implement all at once.

Initial mature target:
- 6–8 Prime Regions with Branch content,
- 2–3 Regions with two contrasting Branches,
- 10–15 stable authored Branches total,
- 30–50 Branch-origin equipment identities,
- 15–25 Branch Runes / fixed identities,
- 10+ altered Boss identities,
- multiple Codex comparison records.

These are content goals, not a requirement for M4 architecture proof.

## Future Story Expansion III seeds

Observed Branches can eventually raise larger questions:
- Why do only some historical possibilities stabilize?
- Who or what decides which possibilities are observed strongly enough to persist?
- Can a Branch observe Prime back?
- Did the original Eighth Key connection exist in every Branch?
- Are there Branches where no Eighth Key exists?
- Is the external civilization seeing the same set of Branches?
- Is the “missing interval” the moment histories diverge, merge, or become unobservable?

Do not answer all of these in the horizontal system itself.

## Success criteria

Observed Branches succeeds when the player sees a familiar Region and immediately asks:

> 「この世界では、あの時何が違ったんだ？」

and when the resulting equipment makes them ask:

> 「この世界は何を発達させて、代わりに何を失ったんだ？」

The multiverse should deepen existing places, builds and mysteries rather than replace them with an unrelated second game.