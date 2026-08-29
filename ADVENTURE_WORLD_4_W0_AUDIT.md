# Adventure / World 4.0 — W0 Architecture Audit

## Status

**W0 — Architecture Audit: COMPLETE**

This document freezes the architecture contracts that World 4.0 must respect before W1 implementation begins.

World 4.0 is an Adventure Layer over the existing game. It does not replace Story, Stage, BattleEngine, Loot, World Tier, World Event, Settlement, Realm, Nemesis, or existing exploration state.

---

## 1. Authoritative source map

| Concern | Authoritative source | World 4.0 rule |
| --- | --- | --- |
| Save root | `js/state.js` / `state.data` | Reuse the existing save key and additive optional namespaces. Never reset or fork legacy saves. |
| Story progression | `state.data.stageProgress`, `CHAPTERS` / `js/data/stages.js` | Adventure routes reference existing `stageId`s. Never create parallel story completion. |
| Story canon / reveal rules | `js/data/storyCanon.js` and existing story data | Adventure presents and connects canon; it must not silently change progression, rewards, or unlock gates. |
| Region identity for Story stages | stage `regionId`, `regionTheme`, `fieldRule`, `explorationEvents` generated in `js/data/stages.js` | W1 region adapters start from existing stage/chapter region metadata instead of redefining it. |
| Battle rules | `js/battleEngine.js` | Never reproduce enemy/stat/turn/combat calculations in Adventure code. |
| Text battle handoff | `TextBattleScreen.start(stageId, onEnd, blessingId)` | Adventure encounters resolve to an existing or data-built stage and enter through the existing battle screen boundary. |
| World Tier | `state.data.worldTierId`, `js/data/worldTiers.js`, `js/patches/worldTierRuntime.js` | Adventure may inspect tier for visibility/conditions; it must not reapply enemy, reward, drop, or item-power multipliers. |
| Persistent world discoveries | `state.data.world2.discoveries` | Do not create a second permanent Discovery collection. |
| Persistent world flags | `state.data.world2.flags` | Reuse for existing global/world facts when the concept already belongs there. |
| Existing event chains | `state.data.world2.eventChains` | Extend/adapt the existing event model rather than inventing a parallel chain system for equivalent content. |
| Settlement state | existing `settlement*` state under `state.data` | Adventure writes through settlement APIs/hooks, not copied World 4.0 settlement fields. |
| Season / weather / daypart | Settlement 3.0 cycle via `settlementSeasonState()` | World 4.0 consumes the existing game-progress cycle. No real-time clock gate and no second season clock. |
| Settlement-local exploration | Settlement 3.0 exploration state | Keep settlement-local discoveries owned by Settlement; World exploration may link to them but not duplicate them. |
| Home Adventure entry | existing `goStageBtn` primary CTA (`冒険する`) | Replace/evolve the destination behind the existing Adventure CTA. Do not add another Home-level World button. |

---

## 2. Save ownership contract

### Existing save remains authoritative

`StateManager` and `state.data` remain the single save root. World 4.0 must follow the existing additive `ensure()` pattern used by World 2.0 and Settlement 3.0 so an old save can load without a destructive migration.

The existing save key must not be changed solely for World 4.0.

### One new World 4.0-owned namespace is allowed

W1 may introduce:

```js
state.data.adventure4
```

Its ownership is deliberately narrow: **active Adventure Session state only**.

Proposed minimum schema:

```js
{
  version: 1,
  active: false,
  regionId: null,
  routeId: null,
  currentNodeId: null,
  visitedNodeIds: [],
  discoveredThisRun: [],
  cluesThisRun: [],
  temporaryFlags: {},
  campUsed: false,
  seed: null,
  pendingEncounter: null,
  returnTarget: null
}
```

Rules:

- `adventure4` is resumable session/navigation state, not a second world database.
- `discoveredThisRun` / `cluesThisRun` hold references or session summaries only. Permanent discoveries are committed to the canonical owner (`world2`, Settlement, Codex, Research, etc.).
- No gold, EXP, equipment inventory, companion ownership, Story clear flags, World Tier values, permanent discoveries, Settlement building state, or Realm ownership may be copied into `adventure4`.
- Session schema must be normalized defensively on load; missing fields in legacy saves receive defaults.
- Unknown/newer fields should be tolerated where possible so future schema additions remain additive.

---

## 3. Story wrapping contract

World 4.0 wraps Story rather than replacing it.

### Canonical progression

- `CHAPTERS` / stage definitions remain the authored Story skeleton.
- `state.data.stageProgress` remains the completion authority.
- Existing `requires` relationships and chapter unlock logic remain authoritative.
- A Story Adventure node stores/references `stageId`; it does not clone the stage definition.
- Story completion is recognized only through the existing stage/battle completion path.

### Deterministic Story route

- Required Story nodes are authored, deterministic route anchors.
- RNG may decorate the journey around them, but it may not decide whether a required Story node exists.
- Rumor, Secret, Weather, Companion, Job, Equipment, Rune, or Rare Event conditions may provide alternate information or shortcuts, but cannot be the only route to mandatory Story progress.
- Adventure presentation must respect `storyCanon` reveal rules: useful clues are surfaced progressively and narrative code does not silently modify gameplay progression/rewards.

---

## 4. Region / Route / Node adapter contract

Existing stage data already carries regional identity. W1 therefore begins as an **adapter layer**, not a second content database migration.

### Region

A World 4.0 Region initially derives from existing chapter/stage region metadata, including where present:

- `regionId`
- `regionTheme`
- `fieldRule`
- `explorationEvents`
- existing regional exploration definitions
- existing World 3 / Realm / Machine / Rift metadata

A later authored Region registry may normalize these sources, but it must point back to existing stage/content IDs rather than duplicate their combat/reward definitions.

### Route Graph

Routes are graph/navigation definitions. Existing Phase 9 exploration stages already demonstrate branch/requires chains and must be adapted rather than recreated.

### Node

A node identifies an activity and its canonical target, for example:

```js
{ id, type: 'battle', stageId }
{ id, type: 'scene', sceneId }
{ id, type: 'discovery', discoveryId }
{ id, type: 'settlement-link', locationId }
```

The node itself should not own combat stats or duplicate reward tables when a canonical stage/system already owns them.

### Scene

Scene owns presentation and choice flow:

`Observation -> Investigation -> Resolution`

Resolution delegates permanent mutations to the canonical owning system.

---

## 5. Battle handoff contract

`TextBattleScreen.start(stageId, onEnd, blessingId)` is the Adventure-to-battle boundary.

World 4.0 must:

1. resolve a Node/Scene encounter to a valid stage or existing data-built stage ID;
2. persist enough Adventure Session state to resume safely;
3. call the existing text battle screen;
4. receive the existing result callback;
5. let existing battle/runtime patches apply World Tier, loot, World 2.0, Settlement, Nemesis, Codex, etc.;
6. advance or branch the Adventure Session based on the returned result.

World 4.0 must **not**:

- calculate enemy HP/ATK/DEF/SPD;
- multiply World Tier rewards again;
- roll duplicate equipment drops;
- independently grant stage clear credit;
- bypass existing battle-finish hooks;
- treat retreat as a normal clear.

This keeps every existing post-battle integration active automatically.

---

## 6. Knowledge ownership contract

World 4.0 Knowledge is a **presentation/progression model derived from existing facts**, not a new character level.

Conceptual ladder:

`Unknown -> Rumor -> Trace -> Clue -> Discovery -> Research`

But there is no `Knowledge Lv`, `Exploration XP`, or Adventure skill tree.

### Permanent ownership

- Existing world discoveries, rumors, traces, flags, and event-chain facts continue to use the current `world2` stores where applicable.
- Settlement-specific discoveries stay in Settlement.
- Codex knowledge stays in Monster Codex.
- Research unlocks stay in Settlement Research.
- Realm/Nemesis/etc. facts remain owned by their systems.

World 4.0 may build a read-model/index that answers questions such as “how much does the player know about this node?” but that index must be reproducible from canonical state or store only World-4-specific facts with no existing owner.

---

## 7. Season / Weather / Living World contract

Settlement 3.0 already owns a deterministic game-progress cycle and exposes season, weather, daypart, and seasonal hooks.

World 4.0 will use that state as the initial shared world clock.

Rules:

- No real date/time requirement.
- No Adventure energy timer or respawn clock.
- No parallel `world4Season` counter.
- A completed/returned Adventure may advance the existing cycle only through a clearly defined shared hook in a later phase.
- Weather/season can affect visibility, event weighting, route state, or optional opportunities, but cannot make mandatory Story permanently inaccessible.

---

## 8. Settlement return-loop contract

Settlement is the existing “place to return to.” World 4.0 connects Adventure outcomes back into it instead of building a second town layer.

Allowed integrations include existing APIs for:

- materials;
- residents;
- tavern rumors;
- research;
- settlement exploration;
- expeditions;
- chronicle;
- season/weather hooks;
- ranch / companion interactions;
- market / production / defense where appropriate.

The Adventure result screen may summarize these changes, but it must not own copies of Settlement values.

---

## 9. Navigation / mobile UI contract

UI Foundation 3.0 already reorganizes Home around a single primary `goStageBtn` labeled `冒険する`.

World 4.0 must reuse that entry.

Target navigation hierarchy:

```text
Home
 -> 冒険する
   -> World / Region
     -> Route
       -> Node / Scene
         -> Battle / Event / Discovery
```

Rules:

- no new top-level Home card for World 4.0;
- one screen, one primary purpose;
- do not render every Region/Route/Node as one giant scrolling list;
- use progressive disclosure and back navigation;
- preserve existing button/listener compatibility while the Stage screen is incrementally replaced/adapted.

---

## 10. Existing exploration systems: reuse, do not erase

World 4.0 is a unification layer over prior exploration work.

Phase 9 regional exploration already creates branch stages with authored route identity, `requires`, repeatability, farming identity, regional rewards, and hidden-boss chains. These remain valid content assets.

World 2.0 already has persistent discoveries, world flags, key realms, events, event chains, and post-clear hooks.

Settlement 3.0 already has local exploration and a living cycle.

Therefore W1/W2 should build adapters that translate these assets into Region/Route/Node/Scene views before authoring large new content packs.

---

## 11. Explicit no-duplicate matrix

| Do not create in World 4.0 | Use instead |
| --- | --- |
| `storyCompleted`, `chapterProgress` | `state.data.stageProgress` + existing Stage/Chapter APIs |
| Adventure enemy stats/scaling engine | `BattleEngine` |
| Adventure loot engine | existing BattleEngine/Loot pipeline |
| `world4Tier`, Adventure difficulty multiplier | existing `worldTierId` / World Tier runtime |
| second permanent `discoveries` dictionary for existing facts | `state.data.world2.discoveries` / owning system |
| second global flag store for existing facts | `state.data.world2.flags` / owning system |
| second event-chain engine for equivalent World events | existing World 2.0 event-chain model, extended only when required |
| second Settlement | Settlement 3.0 |
| second season/weather clock | Settlement 3.0 season cycle |
| Adventure Lv / Exploration XP | existing character/build progression + knowledge facts |
| Energy / Stamina / Daily Adventure | none |
| real-time respawn gates | deterministic game-progress state |
| mandatory Story RNG | authored deterministic Story route |
| permanent-loss inventory/companion risk | none |
| second Home Adventure button | existing `goStageBtn` / `冒険する` |

---

## 12. W1 implementation boundary

W1 may now implement **World / Region foundation** under these frozen contracts.

W1 should contain only the minimum foundation required to prove the architecture:

1. data-first Region adapter/registry built from existing chapter/stage region metadata;
2. stable Region IDs and Story-stage references;
3. `adventure4` session normalization with legacy-save-safe defaults;
4. read-only APIs for available Regions and current session;
5. tests for Region derivation, save normalization, and no mutation of existing canonical progression;
6. no full Route/Scene UI explosion yet;
7. no new reward/scaling/knowledge-level systems.

The first vertical slice after the foundation should prove:

`existing Story stage -> Region/Route/Node wrapper -> TextBattleScreen -> existing result hooks -> Adventure Session resumes`

before large Event/Secret/Region content authoring begins.

---

## 13. W0 completion checklist

- [x] Identify save root and legacy-save strategy.
- [x] Freeze World 4.0-owned save namespace and ownership boundary.
- [x] Identify canonical Story progression and Story canon sources.
- [x] Define Story wrapping / deterministic mandatory-route rule.
- [x] Identify BattleEngine/TextBattleScreen handoff boundary.
- [x] Confirm World Tier is already applied in combat/runtime.
- [x] Identify permanent Discovery / flags / event-chain ownership.
- [x] Identify existing Region/exploration assets to adapt.
- [x] Identify Settlement return-loop ownership.
- [x] Identify shared season/weather/daypart source.
- [x] Confirm existing Home Adventure CTA must be reused.
- [x] Define W1 scope and explicit duplicate-system prohibitions.

**W0 is complete. Proceed to W1.**
