# BLADE VALE — Core Loop Rework Roadmap

> Status: **PRIORITY REWORK — Observed Branches M3+ PAUSED UNTIL CLR FOUNDATION IS STABLE**
>
> Core thesis: **ハクスラしていたら世界やストーリーが見えてくる。**
>
> Design correction: **ストーリーシステムを削るのではなく、ストーリーをハクスラループの中に戻す。**

---

## 1. Why this rework exists

Blade Vale has accumulated strong Story, World 4.0, Discovery, Rumor, Chronicle, Research, Codex and Observed Branch foundations. That richness created a new problem: the player can increasingly feel that combat exists to bridge story/exploration screens instead of story/exploration being rewards and consequences of combat.

The game must return to its core fantasy:

```text
戦う
  ↓
経験値を得る / Lvが上がる
  ↓
装備が落ちる
  ↓
ビルドが強くなる
  ↓
前より強い敵・危険なRouteへ行ける
  ↓
さらに良いLoot / Rare / Uniqueを狙う
  ↓
その過程で世界・人物・歴史・秘密が見えてくる
```

The player should not think:

> 「次のストーリーを見るために戦闘を1回こなす」

The target feeling is:

> 「装備を掘って強敵を倒していたら、知らなかった世界の事情が見えてきた」

Story remains important, but **combat + growth + loot is the engine**.

---

# 2. New core pillars

## Pillar A — Combat is the default verb

A normal expedition contains repeated combat. Non-combat Scenes are punctuation, not the majority activity.

Target baseline:
- Story expedition: roughly **5–8 battles** before/through a major story resolution.
- Hunt expedition: roughly **8–12 battles**, with optional Elite/Rare/Boss escalation.
- Deep/Dungeon route: roughly **10–15 encounters**, majority combat.

Exact counts remain content-driven, but a route containing one battle surrounded by long Story/Event chains is no longer the default.

## Pillar B — Loot is a frequent answer

Combat should repeatedly answer:
- Did something useful drop?
- Is this stronger than my current item?
- Does this change my build?
- Can I now challenge a stronger enemy band?

Existing Loot / Equipment / Option / Item Power / Unique / Rune authorities remain canonical. This rework does **not** create a second loot system.

## Pillar C — Level growth must be felt

Player Lv up to 99,999 must matter as an experiential axis, not only as a number in the save.

The desired loop is:

```text
昨日: Lv 2,300帯のEliteに負ける
  ↓
周回 / Lv上げ / 装備更新
  ↓
今日: 同Eliteを撃破
  ↓
Lv 2,600帯のRouteへ踏み込む
```

Use **soft recommended bands**, not arbitrary hard level locks wherever possible.

Important Story must not require unreasonable grinding. Hunt content is where players deliberately push above/below their comfort band.

## Pillar D — Story emerges from play

Lore/Story is delivered by combat consequences and expedition discoveries:
- enemy defeat reveals a trace,
- Elite defeat opens a hidden route,
- Boss defeat changes a Region,
- repeated encounters reveal ecology,
- a dropped relic triggers Chronicle/Codex interpretation,
- battle aftermath reveals Rumor / Discovery,
- Branch Sight reveals an impossible post-battle observation.

Long mandatory dialogue chains should not become the default progression grammar.

## Pillar E — Same Region, different intent

Do not add separate Home buttons for Story Mode and Gear Mode.

Preferred hierarchy:

```text
Home
 → 冒険する
   → World
     → Region
       → [Story / 物語を追う]
       → [Hunt / 装備を探す]
       → existing special activities when relevant
```

Story and Hunt are **intent profiles inside the same Region**, not separate games.

---

# 3. Expedition grammar

The new default expedition grammar is:

```text
Region entry
  ↓
Battle
  ↓
Post-Battle Result
  ├─ Loot
  ├─ EXP / Lv feedback
  └─ Aftermath Event
       ↓
Route Choice
  ├─ standard battle
  ├─ dangerous battle
  ├─ Elite
  ├─ treasure / resource
  ├─ camp
  ├─ investigation / story
  ├─ rare encounter
  └─ hidden route (only when discovered)
       ↓
Battle
       ↓
Aftermath / Choice
       ↓
...
       ↓
Elite / Boss / Story Resolution
       ↓
Return + Loot summary + discoveries/world consequences
```

### Rule: Battle → aftermath → choice

A post-battle event is the preferred place for World 4.0 narrative/exploration content.

This reverses the emphasis from:

```text
Scene → Scene → Choice → Battle → Scene
```

to:

```text
Battle → Loot → Event → Choice → Battle
```

World 4.0 Scene/Discovery work remains useful; it is re-sequenced around combat rather than discarded.

---

# 4. Post-Battle Event model

After a battle, the expedition may resolve one concise aftermath event.

Families:
- **Route** — choose safe / dangerous / unknown path.
- **Elite sign** — pursue a stronger enemy.
- **Treasure** — chest, relic, material vein, monster nest.
- **Camp** — recovery / inspect findings / return.
- **Lore** — corpse, ruins, weapon mark, local testimony.
- **Discovery** — canonical `world2.discoveries` fact.
- **Rumor / Chronicle / Research hook** — existing knowledge authorities.
- **NPC** — short encounter that changes a later node.
- **Nemesis trace** — existing Nemesis authority.
- **Rift / Secret / Branch anomaly** — existing systems become discoverable through play.

### Battle performance may affect opportunities

Only use information the existing battle result contract safely exposes after CLR-0 audit.

Possible authored conditions if supported:
- decisive win → optional high-danger route,
- low remaining HP → camp/rescue opportunity,
- Elite clear → secret/treasure route,
- specific enemy family → ecology clue,
- first defeat of a named enemy → Codex/Chronicle reaction,
- Branch Sight active → otherwise invisible aftermath observation.

Do not invent parallel battle telemetry just to support this.

---

# 5. Story Expedition

Story mode remains canonical Story progression and still uses `CHAPTERS`, existing `stageId`s and `stageProgress` authority.

But presentation changes from “Story screen with battles” to **combat expedition with authored story beats**.

Target rhythm:

```text
Battle
 → short story aftermath
 → Battle
 → clue / route choice
 → Battle
 → character/world event
 → Elite
 → major reveal
 → Battle/Boss
 → story resolution
```

### Story rules

- Mandatory Story anchors are deterministic.
- Important Story cannot be gated behind Rare/RNG events.
- Story routes may contain shortcuts/optional danger, but canonical completion remains reachable.
- Story scenes should become shorter and more contextual where possible.
- Existing Story canon is preserved; this is a delivery/loop rework, not a lore rewrite.
- First clear can be more authored; replay should avoid forcing long already-read narrative.

### Replay behavior

After Story clear:
- Region remains useful through Hunt.
- Already-read mandatory story text should be skippable/condensed by existing or future presentation hooks.
- Story completion does not consume the Region as disposable content.

---

# 6. Hunt Expedition

Hunt is the dedicated **combat / level / gear farming intent** for a known Region.

It is not a second world and does not own separate progression.

Core traits:
- high battle density,
- shorter text,
- repeated branching,
- frequent loot feedback,
- Elite/Rare opportunities,
- optional Boss escalation,
- Region-specific enemy ecology and drop identity,
- discoveries/story fragments can still emerge naturally.

Target rhythm:

```text
Battle
 → Loot
 → [安全] [危険] [痕跡を追う]
 → Battle
 → Loot
 → Elite opportunity
 → Battle
 → Treasure / Rare / Story fragment
 → Boss or Return
```

### Hunt must not become a chore system

No:
- daily Hunt count,
- stamina,
- energy,
- real-time resets,
- Hunt currency,
- Hunt XP / Hunt Lv,
- mandatory streak maintenance.

The reward is existing EXP + existing loot + existing discoveries/content.

---

# 7. Danger and level-band design

## Soft danger bands

Each Region/Route may offer authored combat bands relative to existing content and player progression.

Example presentation:

```text
安定域      推奨 Lv 2,100–2,300
危険域      推奨 Lv 2,300–2,600
深部        推奨 Lv 2,600–3,000
異常個体域  推奨 Lv 3,000+
```

These are **recommendations**, not a new progression resource.

Where existing stage/World Tier scaling supports it, players may deliberately overreach for harder fights.

## Level-up feedback

The game should make growth visible:
- current player Lv,
- enemy/recommended band,
- newly comfortable danger band,
- stronger enemy title/rank,
- reward quality change using existing authorities.

Do not add a new Gear Score gate as a replacement for Lv.

## World Tier relationship

World Tier remains global state pressure and existing reward/scaling authority.

It must not become:
- the Story/Hunt selector,
- the Branch selector,
- a duplicate danger-band system.

Danger band + World Tier may combine through existing scaling authority after audit, but multipliers must never be applied twice.

---

# 8. Loot escalation philosophy

Hunt needs visible reasons to choose danger.

Without creating a second reward system, harder routes should be able to influence canonical drop context such as:
- higher enemy level,
- Elite/Rare density,
- Boss access,
- Region-specific loot pool opportunities,
- existing Item Power / rarity / Option systems,
- Unique / fixed identity eligibility where canonically authored.

The exact numeric mapping belongs to CLR-0/CLR-4 audit and existing reward authorities.

### Important rule

Harder route must not mean only:

> same enemy, more HP, +10% gold

It should increasingly mean:
- more dangerous enemy composition,
- Elite/Rare variants,
- different encounter ecology,
- better/rarer loot opportunities,
- greater chance to expose hidden content,
- Boss/Nemesis/Rift/Secret interactions.

---

# 9. Story / Hunt content ratio

These are design targets, not hard runtime percentages.

### Story expedition
- Combat: **~65–75% of active decisions/time**
- Story/Investigation/Choice: **~25–35%**

### Hunt expedition
- Combat/Loot/Build decisions: **~85–95%**
- Lore/Discovery/Events: **~5–15%**

A story-heavy chapter may temporarily exceed these targets, but the full game should not drift back into a text-first default.

---

# 10. World 4.0 reinterpretation

World 4.0 is not removed.

Keep:
- World / Region,
- Route Graph,
- Node,
- Scene,
- Discovery,
- Rumor / Trace / Clue,
- Hidden Route,
- Mystery,
- Nemesis integration,
- Weather/World Event integration,
- Settlement return loop.

Change the priority:

### Before

```text
explore → investigate → story/event → occasional battle
```

### After

```text
fight → loot → aftermath → choose route → fight
                     ↓
              discovery / story
```

The Adventure layer becomes the structure that gives **meaning and variation to repeated combat**, not a replacement for repeated combat.

---

# 11. Observed Branches reinterpretation

Observed Branches is particularly suited to the new core loop.

A Branch must not be primarily a lore exhibit.

Example — 王樹領:

```text
First Story Expedition
  Battle: altered forest species
  ↓
  aftermath: impossible survival trace
  ↓
  Battle: symbiotic pack
  ↓
  Elite: 王樹騎生体
  ↓
  reveal: canopy society / living construction
  ↓
  Battle
  ↓
  Boss: 王樹神体グラン・シルヴァ
  ↓
  Branch history resolution + first Branch loot

After clear
  ↓
王樹領 Hunt
  - repeated high-density battles
  - Bio/Arcane ecology
  - branch-specific loot opportunities
  - Rare/Elite/Boss variants
  - remaining discoveries and Chronicle fragments
```

Therefore **Observed Branches M3+ is paused** until CLR establishes the combat-first Region presentation and expedition contracts.

M0–M2 work remains valid:
- authority audit,
- Branch data model,
- discovery/secrecy.

M3/M4 will resume on the new core loop instead of implementing the old story-forward presentation.

---

# 12. Existing authority contracts

The rework must reuse existing authorities.

- Story progression: existing `CHAPTERS` / stage definitions / `stageProgress`.
- Battle: `js/battleEngine.js` + existing TextBattleScreen handoff.
- Loot/reward: existing battle finish / reward / loot pipelines.
- Lv/EXP: existing player progression authority.
- World Tier: existing `worldTierId` and runtime patches.
- Equipment: existing Gear/Option/Item Power/Unique/Rune authorities.
- Adventure session: existing `state.data.adventure4` owner.
- Discovery: existing `world2.discoveries`.
- Rumor/Trace/Clue/Chronicle/Research/Codex: existing owning systems.
- Nemesis/Rift/Secret Realm/Abyss/Machine Realm: existing systems; integrate, never clone.

No new universal:
- combat engine,
- loot inventory,
- Story clear root,
- EXP system,
- Hunt level,
- Hunt token,
- exploration stamina,
- Branch currency,
- Gear Score progression gate.

---

# 13. Implementation roadmap

## [ ] CLR-0 — Combat / Story / Loot / Level audit

Measure and freeze current reality before changing behavior.

Audit:
- existing TextBattleScreen start/end/result contract,
- battle finish hooks,
- EXP grant authority,
- level scaling and Lv 99,999 curve,
- loot/drop/rarity/Item Power authority,
- Elite/Rare/Boss encounter construction,
- Adventure Session battle-node continuation,
- Story-stage wrapping,
- current Chapter/Region battle density,
- World Tier interaction,
- replay/skip behavior,
- Abyss/Rift/Secret/Machine/Nemesis integration.

Deliverable:
- `CORE_LOOP_CLR0_AUDIT.md`
- authority matrix,
- representative current battle-density samples,
- exact safe extension points for CLR-1–4.

No gameplay rebalance in CLR-0.

## [ ] CLR-1 — Multi-Battle Expedition Foundation

Make repeated combat the normal Adventure Session rhythm.

Requirements:
- battle node returns safely to the same active expedition,
- multiple sequential battle nodes work without leaving/restarting the Region flow,
- retreat/defeat/clear remain distinguishable,
- existing battle finish hooks run once,
- loot/EXP/stage clear are never duplicated,
- resume/save remains valid between encounters.

Initial vertical slice should use one existing Region before broad migration.

## [ ] CLR-2 — Post-Battle Aftermath & Route Choice

Add concise data-driven aftermath resolution after battle.

Requirements:
- Battle → result → aftermath → next route,
- 2–3 meaningful route choices where authored,
- Battle/Event/Elite/Treasure/Camp/Story/Discovery targets reuse existing node contracts,
- no huge prose wall,
- no mandatory Story on RNG-only aftermath,
- battle-result conditions only use audited existing result data.

## [ ] CLR-3 — Story / Hunt Region Intents

Expose two primary intents inside Region context:
- **Story / 物語を追う**
- **Hunt / 装備を探す**

Requirements:
- no new Home button,
- same Region identity,
- same character/equipment/Lv/save,
- Story uses canonical progression,
- Hunt uses known/cleared Region context,
- Hunt never creates parallel progression,
- compact mobile selector.

## [ ] CLR-4 — Level Band & Danger Escalation

Restore the pleasure of levelling and pushing stronger enemies.

Requirements:
- authored recommended Lv bands,
- soft overreach where safe,
- enemy difficulty uses existing scaling authority,
- existing World Tier applies exactly once,
- harder routes increase encounter quality/content, not only numeric HP,
- no Gear Score gate,
- no new Hunt Lv.

Audit/rebalance representative low/mid/high/endgame bands including the long Lv curve toward 99,999.

## [ ] CLR-5 — Loot Hunt Density & Elite/Rare/Boss Loop

Make Hunt rewarding enough to repeat.

Targets:
- frequent canonical loot feedback,
- authored Elite opportunities,
- Rare encounter hooks,
- optional Boss escalation,
- Region-specific equipment identity,
- Unique/fixed-identity targets where appropriate,
- danger vs reward clarity.

Do not add a new rarity or fourth random Option.

## [ ] CLR-6 — Story Combat-Density Migration

Migrate Story presentation toward combat-first expedition grammar.

Approach:
1. choose representative early/mid/late chapters,
2. validate pacing,
3. migrate remaining Story routes in batches.

Requirements:
- preserve canon and stage progression,
- increase battle density where currently too sparse,
- split long narrative stretches with meaningful encounters,
- move appropriate exposition to battle aftermath,
- keep major emotional/cinematic scenes intact where needed,
- replay does not force unnecessary long text.

## [ ] CLR-7 — World 4.0 Content Rebalance

Reclassify existing World 4.0 content around the new loop.

Targets:
- Ambient events become brief punctuation,
- Investigation events more often originate from battle aftermath/traces,
- Mystery/Secret routes culminate in meaningful combat/reward more often,
- Nemesis becomes a strong Hunt escalation target,
- World Events alter encounter pools and route danger,
- Discovery remains valuable but no longer dominates moment-to-moment play.

## [ ] CLR-8 — Endgame Loop Alignment

Verify the new expedition loop complements rather than replaces:
- Abyss,
- Rift,
- Secret Realm,
- Machine Realm,
- EX bounty / Nemesis,
- other existing endgame modes.

Abyss can remain the strongest pure vertical push. Region Hunt provides repeatable world-based gear/level hunting. Observed Branches provide horizontal ecology/build variation.

## [ ] CLR-9 — Observed Branches M3/M4 Rebase

Resume Observed Branches after CLR contracts are stable.

Rebuild M3/M4 around:
- Story/Hunt Region intent,
- combat-first Branch expedition,
- post-battle history reveals,
- Branch ecology through repeated encounters,
- Branch-specific Hunt after first clear,
- Branch gear as a reason to return.

First proof remains **王樹領・深緑の森**.

---

# 14. Acceptance criteria for the rework

The rework is successful when all of these are true:

1. A player can spend a session primarily **fighting and looting** without leaving the living World/Region structure.
2. Story progression still feels authored and meaningful but is no longer the majority moment-to-moment verb.
3. Clearing battles frequently produces a decision, loot evaluation, new route, or discovery.
4. Levelling visibly expands the range of enemies/routes the player can realistically challenge.
5. Regions remain useful after their Story clear because Hunt exists.
6. Existing Story, World 4.0 and Observed Branch lore work is reused rather than deleted.
7. Observed Branches become replayable combat/ecology/gear destinations, not one-time lore screens.
8. No duplicate Battle/Loot/EXP/Story/Discovery authority is introduced.
9. No stamina/daily/FOMO/Hunt currency/Hunt Lv is introduced.
10. Mobile navigation remains compact and no new Home-button sprawl returns.

---

# 15. North-star test

Before approving any future Story/World/Branch feature, ask:

> **これを追加すると「戦う → 強くなる → 装備を掘る → さらに強い相手へ挑む」というハクスラの循環が強くなるか？**

Then ask:

> **その循環の結果として、世界やストーリーが自然に見えてくるか？**

If the feature tells more story but weakens the first loop, redesign it before implementation.
