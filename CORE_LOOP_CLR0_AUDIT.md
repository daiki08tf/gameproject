# Blade Vale — Core Loop Rework CLR-0 Audit

## Status

**CLR-0 — Combat / Story / Loot / Level audit: COMPLETE**

This audit freezes the current runtime ownership and identifies the minimum safe extension points for CLR-1–4. CLR-0 changes no gameplay balance constants.

The central diagnosis is architectural rather than numerical:

> Blade Vale already has functioning Battle, EXP/Lv, Loot, Gear and World Tier pipelines. The current loss of hack-and-slash rhythm is primarily caused by Adventure route topology and presentation cadence placing too many Scene/Event nodes between too few distinct battles.

The representative World 4.0 pilot confirms this. Its Story route is effectively `Scene -> Event -> one Battle -> Return`, while its cleared-region Free Adventure route spends most of its path in Scene/Treasure/Camp nodes before a canonical Region Boss. The combat engine is not the bottleneck; the expedition graph is.

Therefore the core-loop rework must not replace BattleEngine or create a parallel Hunt progression. The safe direction is to make **multiple distinct canonical battle nodes** the backbone of an Adventure Session, then place concise aftermath/story/discovery beats between those battles.

---

## 1. North-star correction

The target grammar is:

```text
Battle
 -> canonical EXP / Lv growth
 -> canonical Loot
 -> short aftermath / event
 -> route choice
 -> Battle
 -> Elite / Rare opportunity
 -> Loot / build update
 -> stronger route
 -> Boss
 -> Story / Discovery consequence
```

Story is preserved, but its default position changes from “thing the player repeatedly stops to read” to “meaning revealed because the player fought, explored and won”.

CLR-0 explicitly rejects solving the problem by:
- deleting Story,
- adding a second combat engine,
- adding Hunt EXP / Hunt Lv / Hunt currency,
- adding stamina/energy/daily rotations,
- duplicating Loot or stage-clear grants,
- multiplying World Tier rewards again,
- converting BattleEngine waves into the expedition route system.

---

## 2. Authority matrix

| Concern | Canonical owner / extension point | CLR rule |
| --- | --- | --- |
| Battle simulation | `js/battleEngine.js` | Keep enemy turns, damage, victory/retreat, internal wave handling and reward triggers here. CLR does not reimplement combat math. |
| Battle UI boundary | `TextBattleScreen` used by `js/patches/adventureWorld4Ui.js` | Adventure resolves a battle node to `stageId`, checkpoints the encounter, launches the existing battle screen, receives its result callback, then resumes Adventure. |
| Adventure session | `state.data.adventure4` via `js/patches/adventureWorld4Session.js` | Own only resumable expedition/session navigation. Never copy permanent EXP, Gold, Gear, Story clear or Discovery into this namespace. |
| Route graph / node movement | `js/patches/adventureWorld4RouteEngine.js` + data in `js/data/adventureWorld4Routes.js` / authored route builders | CLR-1 adds combat density by authoring/connecting multiple battle nodes here, not by changing BattleEngine into an expedition engine. |
| Current pilot content | `js/data/adventureWorld4Pilot.js` | Primary current cadence problem. Reweight route topology around repeated battle nodes. |
| Character EXP / level curve | Progression 2.0 Character Lv authority in `js/data/progression.js` plus its state runtime patches | Character Lv remains the 1–99,999 long-term axis. No Hunt Lv. |
| Job side progression | `state.data.jobs` / `state.js`, refined by `js/patches/progression3Core.js` | Job Lv remains a separate side progression. CLR must not confuse Job Lv with Character Lv when tuning long-term enemy bands. |
| Character growth on level-up | `js/patches/progression3Core.js` | Existing `gainExp` chain records permanent character growth according to the active Job and awards capped Job EXP alongside Character EXP. Preserve this chain. |
| Story level roadmap | `js/patches/levelRoadmap99999.js` | Existing Story Lv1–700 redistribution and long-term eras are reused. CLR-4 may audit/tune content bands later but CLR-0 changes nothing. |
| Enemy level metadata/scaling | existing Enemy 2.0 level data/foundation/scaling patches | Reuse the existing enemy-level/scaling authority. CLR-4 provides authored danger bands through this path rather than another stat formula. |
| Combat difficulty overlays | existing Combat 3 / encounter / boss systems | Treat as downstream combat modifiers/content identity, not a second level authority. |
| Per-enemy EXP/Gold/drop trigger | `js/battleEngine.js` | Every defeated enemy already grants canonical rewards and rolls canonical drops. Repeated battle nodes naturally increase reward feedback without a new reward subsystem. |
| Stage-clear reward / result | `js/battleEngine.js` | Final stage result remains authoritative for `cleared`, `retreated`, earned EXP/Gold/items and first clear. CLR never grants those again from Adventure. |
| Gear generation / item instance rules | existing Equipment/Gear Overhaul authority, including `js/patches/equipment3GearFoundation.js` and later gear layers | Route/Hunt systems request/use canonical drops only; they do not build a second inventory or option generator. |
| World Tier | `state.data.worldTierId`, `js/data/worldTiers.js`, `js/patches/worldTierRuntime.js` | WT applies once through existing runtime. A harder route may alter authored content availability but must not double-apply WT numerical multipliers. |
| Story progression | `state.data.stageProgress`, `CHAPTERS` / `js/data/stages.js`, existing stage completion path | Story battle nodes reference canonical `stageId`. Adventure does not own Story clear state. |
| Story reveal/canon | existing Story data / reveal patches | CLR-6 may move prose to aftermath, but cannot change canon or silently bypass required reveals. |
| Persistent Discovery | `state.data.world2.discoveries` | Battle aftermath may reveal/commit discoveries through the existing owner. No `huntDiscoveries` or duplicate save root. |
| Home navigation | existing `goStageBtn` / Adventure entry | Story and Hunt remain Region intents. No new Home button. |
| Endgame systems | existing Abyss / Rift / Secret Realm / Machine Realm / Nemesis authorities | CLR wraps/aligns these later; it does not replace their progression or reward formulas. |

---

## 3. Exact Adventure -> Battle -> Adventure continuation contract

The current World 4.0 UI already contains the right boundary for CLR-1.

`launchAdventureBattle(node)` in `js/patches/adventureWorld4Ui.js` does the following:

1. requires a canonical `node.stageId`;
2. checkpoints `pendingEncounter:{nodeId, stageId}` into the active Adventure Session;
3. shows `textBattleScreen`;
4. calls `battle.start(node.stageId, result => {...})`;
5. allows existing battle/runtime hooks to finish canonical reward/clear processing;
6. clears `pendingEncounter` after the result callback;
7. renders the normal result screen;
8. provides `冒険へ戻る`, whose continuation calls `renderAdventureRoute()`.

The session remains active throughout this process. `adventureWorld4Session.js` already persists `routeId`, `currentNodeId`, `visitedNodeIds`, temporary flags and `pendingEncounter`. `adventureWorld4RouteEngine.js` already validates the route and calculates reachable next nodes from the current node.

This means CLR-1 does **not** require a new battle-resume protocol. It needs a better route topology plus focused safety tests around repeated battle-node continuation.

### Result ownership rule

Adventure may inspect the returned battle result to choose an aftermath/next route in CLR-2, but it must never reproduce the reward grant.

Canonical result concepts include:
- clear vs retreat/defeat distinction,
- EXP/Gold already granted by BattleEngine,
- items already granted through canonical drop/item paths,
- first-clear/stage completion already handled by canonical completion hooks.

Adventure is a consumer of the result, not its accountant.

---

## 4. BattleEngine internal encounters are NOT expedition battles

`js/battleEngine.js` already supports `stage.encounters` / wave-style sequential encounters inside one stage battle.

That mechanic is useful for one canonical battle, but it is not the CLR expedition loop.

The distinction is permanent:

```text
BattleEngine encounter / wave
  = several enemy groups inside one battle screen / one canonical stage result

Adventure battle node
  = one canonical battle activity inside a longer Region expedition
```

CLR-1 must chain multiple **Adventure battle nodes** so that normal result presentation, loot feedback, aftermath, route choice, save/resume and Story/Discovery hooks can occur between battles.

Do not solve combat density by stuffing six waves into one stage.

---

## 5. Current battle-density sample

### Representative Story route — `buildStoryRoute()`

Current pilot topology:

```text
entry: Scene
 -> fork: Event
 -> story: Battle
 -> return: Camp
```

Combat nodes: **1**.

The required Story battle is canonical and correct, but there is no hack-and-slash journey surrounding it. Most player actions before return are presentation/navigation rather than combat/loot/build progression.

### Representative cleared-Region Free Adventure — `buildFreeAdventureRoute()`

Current main path:

```text
entry: Scene
 -> crossroads: Event
 -> deep-route: Scene
 -> treasure: Treasure
 -> camp: Camp
 -> boss-gate: Scene
 -> region-boss: Boss
 -> return: Camp
```

The shortcut path is even shorter. Optional secret boss logic may add another Boss, but ordinary traversal remains heavily non-combat.

The route data does preserve useful authored structure—branching, treasure, camp, hidden shortcut, canonical boss—but battle nodes are too sparse to serve as a hack-and-slash backbone.

### Conclusion

The new roadmap targets are directionally correct:
- Story expedition: roughly 55–70% combat nodes,
- Hunt: roughly 75–90% combat nodes.

CLR-1 should begin with a smaller proof, not immediately migrate all content: **one existing Region with 4–6 distinct battle nodes in a single active Adventure Session**, including at least one branch and one final strong encounter.

---

## 6. EXP / Lv audit

Blade Vale already has the long-term growth axis needed for the redesign.

`js/data/progression.js` defines Character Lv `1..99,999` in explicit long-form bands and a centralized per-level EXP curve. `js/patches/levelRoadmap99999.js` already redistributes the original Story into approximately Lv1–700 and identifies post-Story/endgame eras extending to Lv99,999.

Important CLR distinction:
- **Character Lv** = long-term power/progression axis used for the 99,999 design.
- **Job Lv** = existing Job-specific side progression.

`js/patches/progression3Core.js` chains the EXP award path so Character EXP continues through the existing Progression 2.0 path, while Job EXP is separately limited and Character level-ups also write permanent growth according to the active Job.

Therefore CLR-4 should create the feeling of “I can now challenge the next enemy band” using existing Character Lv, enemy scaling and authored route danger. It must not introduce another level system.

No EXP curve constant is changed in CLR-0.

---

## 7. Loot / reward audit

Current combat already supports the desired frequent feedback if the player is simply given more battles.

At enemy defeat, BattleEngine already:
- computes and grants enemy EXP,
- computes and grants Gold,
- invokes companion/progression hooks,
- rolls the stage's canonical drop path.

At canonical stage completion it already handles stage rewards, stage clear/first-clear behavior and the final battle result.

This is a strong reason to fix combat density at the route layer first. Four distinct battle nodes automatically produce more legitimate EXP/drop opportunities without adding Hunt-only loot tables or manually granting bonus items from the Adventure layer.

CLR-5 may later tune encounter quality, Elite/Rare frequency and Region loot identity through audited canonical systems. CLR-1 must not pre-empt that balance work.

---

## 8. Retreat / defeat / retry contract

The expedition must preserve canonical battle semantics.

Rules for CLR-1/2:
- `cleared` advances through the authored clear path.
- retreat/defeat must remain distinguishable from clear.
- Adventure must not call Story-clear mutation itself.
- rewards already earned/granted during BattleEngine resolution are not granted again or reconstructed from session state.
- `pendingEncounter` remains the resumable handoff marker; it is not a reward ledger.
- retry/continue UI must not accidentally move the route twice.

CLR-2 may choose authored aftermath branches based on audited result fields, but only after this continuation contract is covered by tests.

---

## 9. Story integration audit

The existing Story authority is compatible with a combat-first redesign because World 4.0 already wraps canonical stages instead of cloning them.

The current problem is cadence, not ownership.

Future Story expedition structure should become closer to:

```text
brief setup
 -> battle
 -> short aftermath
 -> battle
 -> route/event
 -> battle / Elite
 -> major story beat
 -> boss
 -> consequence / discovery
```

Major emotional/cinematic scenes can remain long when they deserve it. The default connective tissue should not be long prose between every action.

Replay should especially favor the combat/loot route and avoid forcing already-read Story walls when no new reveal is being delivered.

---

## 10. Safe extension points for CLR-1–4

### CLR-1 — Multi-Battle Expedition Foundation

Primary extension point:
- authored Adventure route definitions / route builders.

Runtime surfaces to verify with focused tests:
- `state.moveAdventure4ToNode()`
- `state.checkpointAdventure4()`
- `pendingEncounter`
- battle result callback -> `renderAdventureRoute()`
- save/resume between battle nodes.

Initial proof contract:
- one existing Region,
- 4–6 distinct battle nodes,
- same active Adventure Session throughout,
- canonical `stageId` references only,
- no duplicate rewards,
- no forced new save root,
- no BattleEngine rewrite.

### CLR-2 — Post-Battle Aftermath

Primary extension point:
- Adventure result continuation after canonical battle result.

Add a small data-driven aftermath descriptor/read-model that can route to existing node types. It may store only expedition-local routing state in `adventure4`; permanent Story/Discovery state continues to use its owner.

### CLR-3 — Story / Hunt Region intents

Primary extension point:
- Region presentation / route selection behind the existing Adventure entry.

Do not create top-level modes. Select intent after Region context is known:
- `物語を追う`
- `装備を探す`

Both use the same character, equipment, Character Lv, World Tier and save.

### CLR-4 — Level bands / danger

Primary extension points:
- existing Character Lv curve,
- existing enemy level/scaling authority,
- authored Region/route recommended levels,
- existing World Tier state once.

Do not create Gear Score or a Hunt-specific power number.

---

## 11. What CLR-0 deliberately does not change

No changes to:
- EXP curve,
- enemy HP/ATK/DEF constants,
- World Tier multipliers,
- drop rates,
- rarity,
- Item Power,
- Option count/levels,
- Unique rules,
- Story canon,
- stage clear requirements,
- Home navigation,
- save root,
- Observed Branches runtime.

Observed Branches M0–M2 remain valid. M3/M4 stay paused until CLR battle-first contracts are stable, then 王樹領 should be implemented as a combat-first Story expedition followed by repeatable Hunt.

---

## 12. CLR-0 exit criteria

- [x] Battle authority identified.
- [x] Battle result continuation point identified.
- [x] Adventure session / route ownership identified.
- [x] Character Lv vs Job Lv ownership separated.
- [x] Lv99,999 long-term authority identified.
- [x] Loot/reward authority identified.
- [x] Story clear ownership preserved.
- [x] World Tier single-application rule preserved.
- [x] Representative current route density audited.
- [x] Primary root cause identified as Adventure topology/cadence rather than missing combat/reward engines.
- [x] CLR-1 safe extension point fixed as multiple distinct Adventure battle nodes.
- [x] No gameplay/balance constants changed.

**NEXT: CLR-1 — Multi-Battle Expedition Foundation.**
