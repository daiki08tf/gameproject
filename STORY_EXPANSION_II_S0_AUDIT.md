# Blade Vale — Story Expansion II S2-0 Architecture Audit

> Status: **S2-0 COMPLETE / implementation contract for Ch31+**
>
> Scope: audit current Story / Stage / World / Endgame ownership before Story Expansion II adds Ch31–35.

## Executive result

Story Expansion II can extend the current canonical Story pipeline without introducing a new progression system.

Ch31+ should follow the same established expanded-chapter architecture used by Ch16–30:

```text
chapter metadata
  ↓
canonical CHAPTERS / buildExpandedChapter()
  ↓
enemy + equipment generation
  ↓
live progression tuning
  ↓
regional identity
  ↓
journey story beats
  ↓
existing Text Battle / Adventure World presentation
```

The important constraint is that **adding later Story chapters must not silently move already-live endgame unlock gates**.

S2-0 therefore freezes Story ownership, progression boundaries, reward ownership and the first multiverse-foreshadowing rules before Ch31 implementation.

---

## 1. Canonical Story / Stage ownership

### Stage authority

`js/data/stages.js` remains authoritative for canonical Story chapters and stage lookup.

Current chapter construction:
- Ch1 — hand-authored legacy chapter.
- Ch2–15 — standard chapter generator.
- Ch16–30 — `buildExpandedChapter()`.

The expanded chapter contract is currently:
- 8 mandatory main stages,
- stage 4 = authored midboss,
- stage 8 = authored chapter boss,
- optional `-B` branch when chapter metadata defines one,
- branch requires main-stage progress and never owns mandatory Story beats,
- chapter metadata provides the authored/raw recommended-level interval,
- reward tables are built through the existing stage/equipment authorities.

### Ch30 reference implementation

Ch30 is the current latest canonical Story chapter and is the immediate structural reference for Ch31.

Source:
- `js/data/chapters30.js`
- `js/data/storyChapters30.js`
- `js/data/stages.js`
- `js/data/enemies.js`
- `js/data/equipment.js`
- `js/data/regionsPhase9.js`
- `js/data/world3Regions.js`
- `js/patches/story11CoreJourney.js`
- `js/patches/progression3OuterStory.js`

Current Ch30 contract:
- chapter: `第30章 外部観測核`
- raw metadata interval: **6200 → 7600**
- live tuned interval after `progression3OuterStory.js`: **7000 → 7600**
- 8 main stages + 1 optional branch
- final stage: `30-8`
- final boss: `外界照合者オブザーバ`
- existing reverse-observation Region contains Ch26–30
- story beats are narrative-only and attach to main stages
- Story Expansion I added no new Home route, currency or save root.

### Chapter unlock authority

`isChapterUnlocked(chapterIndex, isStageCleared)` remains sequential and derives a chapter from the previous chapter's canonical final stage.

Therefore Ch31 should naturally require Ch30's canonical final clear through the existing Story rule. It must not add a second Story-unlock database.

---

## 2. Battle ownership

Story Expansion II must continue to launch battles through the existing Stage / Text Battle / BattleEngine path.

Forbidden:
- a Story-II-only battle engine,
- direct reward grants that bypass normal stage completion,
- separate Story enemy stat calculations when current Enemy 2.0 / Enemy 3.0 hooks can consume the stage enemy definitions,
- a parallel encounter queue.

Boss behavior may be authored, as existing boss behavior already has priority over generic Enemy behavior.

The permanent mobile encounter-density contract remains authoritative. The Ch30 final encounter demonstrates the existing safe Story pattern: bounded ordinary enemies with one authored final boss rather than an enlarged active enemy pile.

---

## 3. Enemy ownership

`js/data/enemies.js` and the current Enemy 2.0 / Enemy 3.0 layers remain authoritative.

Ch31 should extend the existing chapter metadata pipeline with:
- normal,
- fast,
- tank,
- midboss,
- boss,
- optional branch boss.

Story Expansion II must not:
- create a second enemy database,
- reuse historical Abyss `enemy.elite` semantics for generic Story elites,
- introduce a reward multiplier through Story enemy identity,
- bypass existing effective-stat / role / targeting / authored-Boss rules.

---

## 4. Equipment / reward ownership

Current canonical equipment generation already consumes chapter metadata through `js/data/equipment.js`.

Ch31+ rewards should use that same authority.

Permanent Gear contracts remain:
- max 3 random Options,
- Option Lv1–100,
- existing Option rarities,
- Item Power cap 10,000,
- Fixed / Unique identity separate from random Options,
- no Story-only rarity,
- no Story-only inventory,
- no new Story currency.

Named/Unique rewards may create new build identities, but no Ch31 item may become the only valid solution for later mandatory Story content.

No reward multiplier may be applied once in Story data and again by World Tier / endgame reward layers.

---

## 5. Live progression and endgame unlock freeze

### Story / Abyss fork — authoritative runtime contract

There are two relevant layers that must not be confused:

1. `js/data/stages.js` contains an older defensive helper that filters Story chapters through Ch25.
2. `js/patches/progression3OuterStory.js` is the current live progression bridge and overrides `state.isAbyssUnlocked()`.

The **live runtime contract** is:

```text
Ch20 finale / Lv3000
       ├─ Abyss 1F / Lv3000
       └─ Ch21–30 outer Story / Lv3000→7600
```

`progression3OuterStory.js` explicitly requires only Ch1–20 final clears for the live Abyss gate.

This was a deliberate play/tune correction so the later outer Story does not push the already-live Abyss entry backward.

**Ch31–35 must not change the live Ch20 Abyss fork merely because more Story exists.**

### Outer Story runtime curve

`OUTER_STORY_LEVEL_ROADMAP` currently maps:
- Ch21: 3000 → 3300
- Ch22: 3300 → 3650
- Ch23: 3650 → 4050
- Ch24: 4050 → 4500
- Ch25: 4500 → 5000
- Ch26: 5000 → 5500
- Ch27: 5500 → 6000
- Ch28: 6000 → 6500
- Ch29: 6500 → 7000
- Ch30: 7000 → 7600

Ch31 cannot be appended only to raw metadata while forgetting the live progression bridge. S2-1 must extend or supersede that roadmap deliberately.

### Rift / Secret Realm / Machine Realm / Deep Survey

These systems have their own existing unlock / routing authorities and are already live independently of the Story Expansion II chapter count.

S2-0 freezes the following rule:

> **Appending Ch31–35 is not, by itself, a reason to change any existing endgame unlock condition.**

If a future design deliberately changes an endgame gate, that must be a separate documented balance/progression decision with dedicated regression tests; it must never happen as a side effect of `CHAPTERS.length` increasing.

### Required Ch31 regression

Ch31 implementation must include regression coverage demonstrating:
- live Abyss access still forks after Ch20 at Lv3000,
- Ch21–31 Story remains a parallel route rather than an Abyss prerequisite,
- old Ch1–30 saves do not lose access to already-live endgame activities,
- no endgame builder/reward function begins requiring Ch31 clear solely because Ch31 exists.

---

## 6. Recommended-level continuation

The live Ch30 Story route ends at recommended Lv **7600**.

Ch31 must continue from the live post-tuning Story curve rather than reverting to the raw chapter metadata curve or older chapter multiplier assumptions.

S2-1 must extend the live Story roadmap with a deliberate Ch31 band.

Structural requirements:
- Ch31 starts at **7600**,
- progression is monotonic,
- the new band must be modest relative to the long Lv99,999 account cap,
- Story remains one route alongside endgame progression, not the only leveling lane,
- existing Ch21–30 live values remain unchanged.

A suitable initial Ch31 target should be selected in S2-1 after checking current enemy/reward scaling, then frozen in regression tests.

---

## 7. World / Region ownership

`js/data/world3Regions.js` currently provides the authored regional grouping consumed by later World / Adventure presentation.

Current final Story Region:
- `reverse-observation`
- Ch26–30

Story Expansion II should create or extend an authored Region grouping for Ch31–35 rather than placing five new chapters into a flat top-level list.

Adventure World 4.0 remains a presentation / route / scene layer around canonical Story stages.

Rules:
- Story Stage remains authoritative.
- World 4.0 may present a Story Route and authored scenes.
- World 4.0 must not own Story clear state.
- no new Home button.
- one screen / one purpose and mobile-first hierarchy remain permanent.

---

## 8. Narrative presentation ownership

`js/patches/story11CoreJourney.js` is the established journey-story attachment path.

Ch31 should add a new Story data module / Story-II beat resolver and extend the existing journey dispatcher rather than replacing it.

Mandatory beats remain:
- compact,
- attached only to main Story stages,
- deterministic,
- readable in the existing battle/story presentation,
- independent of optional branch clears.

Optional Discovery / Codex / Settlement context may deepen interpretation but cannot be a rare/RNG gate for mandatory Ch31 progression.

---

## 9. Save / migration impact

The preferred S2-1 implementation has **no new save root**.

Expected persistence:
- Story clear continues through existing stage-clear state,
- optional discoveries continue through existing discovery ownership,
- equipment continues through existing inventory/equipment save data,
- World 4.0 session data remains separate presentation/session state.

Adding static chapter/enemy/item/story definitions therefore should not require destructive migration.

Any new optional clue introduced for Ch31 must prefer an existing discovery/history container before proposing a new saved field.

Unknown legacy fields must continue to be tolerated by existing normalizers.

---

## 10. Story Expansion II canon boundary

Arc V / 共観測 starts from Ch30's confirmed facts:
- the external civilization exists,
- observation is bidirectional,
- the external side can recognize Blade Vale,
- MOTHER / ARCHITECT did not originate the entire connection,
- the Eighth Key is an exception connection outside the normal Seven Keys path.

### Ch31 allowed reveal

Ch31 — `返答の文法` may establish:
- the returned reply has repeatable procedural structure,
- acknowledgement / retry / confirmation-like states exist,
- the reply is not random noise.

It must NOT conveniently become ordinary spoken language.

### Multiverse foreshadowing boundary

Observed Branches is now future canon, but Ch31–35 must earn it gradually.

Ch31 may contain only **pre-multiverse contradiction** such as:
- the same observation packet carrying one impossible timing discrepancy,
- two records agreeing on an event but disagreeing by one unaccounted interval,
- a duplicated response whose second copy has no valid source.

Ch31 must NOT introduce:
- `multiverse` terminology,
- `観測分岐世界 / Observed Branch` terminology,
- Branch Sight / 分岐視,
- Parallax Core / 視差核,
- Branch travel,
- a Branch selector,
- the Transcendent classification.

Those remain later discoveries.

A future player should be able to look back at Ch31 and realize the clue was present without a first-time player being told the answer.

---

## 11. Transcendent foreshadowing boundary

The Transcendent roster is canonical future planning, but Story Expansion II should not front-load it.

Ch31 may at most contain one anomalous signature that later *could* be interpreted as a multi-history observer.

Do not:
- name Asterion / other Transcendents in mandatory Ch31 text,
- show a Transcendent boss,
- explain Walker / Domain Being / Archivist classes,
- imply MOTHER / ARCHITECT are secretly Transcendents.

The first meaningful Walker encounter remains after Branch Sight and the first traversable Branch unless a later roadmap deliberately changes that pacing.

---

## 12. S2-1 implementation checklist — Ch31 vertical slice

Ch31 is ready to implement when all of the following are preserved:

### Data
- [ ] add one authored Ch31 chapter metadata definition,
- [ ] continue expanded-chapter structure,
- [ ] define region tags / region identity,
- [ ] generate enemies through canonical enemy authority,
- [ ] generate equipment through canonical equipment authority.

### Story
- [ ] theme = `返答の文法`,
- [ ] reply is procedural rather than translated speech,
- [ ] compact opening / discovery / mid / boss / clear beats,
- [ ] optional branch remains optional,
- [ ] one subtle contradictory-observation seed maximum.

### World / UI
- [ ] add Ch31 to an authored Story Region,
- [ ] World 4.0 wraps the route without owning progression,
- [ ] no Home route,
- [ ] no giant flat chapter list,
- [ ] mobile battle command envelope preserved.

### Progression
- [ ] Ch30 final clear naturally unlocks Ch31 through existing chapter sequencing,
- [ ] live Abyss Ch20 / Lv3000 fork unchanged,
- [ ] Ch21–30 live progression curve unchanged,
- [ ] Rift / Secret / Machine / Deep Survey existing gates unchanged,
- [ ] no new currency / stamina / Story progression root.

### Regression
- [ ] Ch1–30 Story data remains valid,
- [ ] old endgame access remains valid,
- [ ] no Japan / Tokyo / confirmed Earth reveal,
- [ ] no explicit multiverse / Branch Sight reveal,
- [ ] no BattleEngine duplication,
- [ ] no reward multiplier duplication,
- [ ] Blade Vale Tests green,
- [ ] Phase 8 Validation green.

---

## Decision

**GO for S2-1 / Ch31 vertical slice.**

The safest implementation is an incremental extension of the current Ch30 pipeline plus the live outer-Story progression bridge, not a new Story-II subsystem.

S2-1 should prove one complete Ch31 path before Ch32–35 are added.