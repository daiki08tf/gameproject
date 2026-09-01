# Core Loop Rework — CLR-21 Observed Branches M3/M4 Rebase ✅ COMPLETE

## Goal
Resume Observed Branches under the stable Stage-first Core Loop (CLR-12–20) by making the first authored Branch, **王樹領・深緑の森**, a playable combat destination instead of a lore-only exhibit, without introducing a parallel Branch progression, combat, reward, Hunt, save, or World Tier authority.

## Final player grammar

```text
Chapter 2 / Branch context
  → 観測分岐：王樹領・深緑の森
  → visible authored Branch Stage progression
  → normal Stage detail / combat-first Story
  → existing stageProgress clear
  → Branch Boss clear derives Branch clear
  → Branch Hunt
  → ecology / loot / Rare / generic Elite / Boss replay
```

## Delivered slices

### PR #393 — Stage-first Branch proof
- Added `stageIds` / `bossStageId` references to the existing Branch definition.
- Added ordinary `findStage()`-resolvable Observed Branch Stage definitions.
- Branch Stage unlock/clear derives only from existing `state.data.stageProgress` / `state.isStageCleared()`.
- Existing Stage confirmation and `TextBattleScreen` / `BattleEngine` launch path is reused.
- Existing CP4 Branch discovery remains the visibility/discovery authority.

### PR #394 — M4 loot/profile presentation
- Fixed the Boss first-clear reward to the existing equipment id `ch2_weapon_epic`.
- Ecology and technology presentation is derived from existing `observedBranches.js` profile data.
- No new persistence or Codex authority was introduced.

### PR #395 — Branch Hunt generalization
After Branch clear, all three existing authored Branch Stages become replay targets:

1. `observedbranch-tree-sovereign-1` — ecology/common replay
2. `observedbranch-tree-sovereign-2` — deep / Rare / Elite target replay
3. `observedbranch-tree-sovereign-boss` — Boss replay

The Hunt surface is a read-only projection of already-authored Stages. It adds no Hunt Lv, currency, stamina, session root, or progression flag.

### PR #396 — Enemy 2.0 encounter reuse
- Each 王樹領 Branch Stage projects the canonical Chapter 2 Encounter Pool through `buildChapterEncounterPool()`.
- Fixed authored `waves` remain the fallback/headcount authority.
- Existing Chapter 2 enemy/ecology and Region tags are reused.
- Existing loot ids continue to resolve through the normal Equipment authority.

### PR #400 — Runtime contract proof
Final audit verified that `BattleEngine` itself intentionally keeps fixed-wave construction simple while the already-existing Enemy 2.0 / World Tier patch chain consumes the optional Stage encounter contract:

- `enemy2EncounterPilot.js` passes `this.stage` to `pickEncounterPoolType()`.
- `enemy2RankVariants.js` uses `planRareOverrideTypes()` and `chooseEnvironmentalVariant()` from the Stage encounter pool.
- `worldTierRuntime.js` promotes eligible non-Boss / non-Rare enemies through the existing `eliteChance` and `markGenericElite()` path.
- `enemy2RankVariants.js` finalizes `genericElite` level/rank without setting the historical Abyss `enemy.elite` flag.
- `main.js` imports World Tier runtime before the Enemy 2.0 rank-variant wrapper, preserving the intended wrapper order.
- A focused regression test proves the actual canonical helper behavior against the Observed Branch Stage rather than duplicating runtime logic.

## Authority reuse

- **Story / Stage clear:** existing canonical `stageProgress` authority.
- **Battle:** existing `TextBattleScreen` / `BattleEngine`.
- **Stage resolution:** existing `findStage()` dynamic-stage pattern.
- **Encounter composition:** existing Enemy 2.0 Encounter Pool helpers and runtime patches.
- **Rare:** existing `rareIdentity` / `ch2_rare` authority and Rare planner.
- **Elite:** existing World Tier `eliteChance` → `genericElite` path. Historical Abyss `enemy.elite` semantics remain separate.
- **Loot / EXP / Gold:** existing Stage reward and Equipment authorities.
- **World Tier:** existing global World Tier authority, applied through its existing runtime patch.
- **Discovery:** existing Observed Branch / CP4 discovery authority.
- **Ecology / technology presentation:** derived from existing Observed Branch profile data.

## New authority introduced
None.

Specifically, CLR-21 adds no:

- Branch clear save flag,
- Branch Story progression root,
- Branch combat engine,
- Branch Loot inventory/rarity,
- Branch Hunt Lv,
- Branch currency,
- stamina / energy,
- Branch World Tier,
- duplicate Discovery/Codex save root.

## Regression coverage

Relevant focused suites:

- `tests/core-loop-clr21.test.js`
- `tests/core-loop-clr21-m4.test.js`
- `tests/core-loop-clr21-hunt.test.js`
- `tests/core-loop-clr21-runtime.test.js`

The runtime-proof test locks:

- Branch Stage encounter-pool consumption through the existing BattleEngine patch chain,
- actual canonical pool selection using the Branch Stage object,
- Rare planning and Boss protection,
- generic Elite separation from Abyss Elite authority,
- World Tier / Enemy 2.0 wrapper import order.

## CI / merge record

- PR #393 — first Stage-first playable proof.
- PR #394 — M4 loot/profile completion; PR and main CI green.
- PR #395 — all authored Branch Stages exposed as Hunt replay targets; PR and main CI green.
- PR #396 — Chapter 2 Enemy 2.0 Encounter Pool projection; PR and main CI green. Merge SHA: `acb5b53018bc79d4aa69f31e14ec6b40e056a55e`.
- PR #400 — runtime integration proof; PR **Blade Vale Tests** and **Phase 8 Validation** green. Merge SHA: `69252a339b866b2edd7a92cf0d845e41467af558`. Both workflows also green on `main` after merge.

## Completion judgment
CLR-21's first-proof contract is complete for **王樹領・深緑の森**:

```text
Branch / Chapter context
→ visible authored Stage progression
→ combat-first Story
→ Branch clear
→ Branch Hunt
→ Branch ecology / loot / Rare / Elite / Boss replay
```

The remaining Observed Branches are future content/generalization work and must reuse this proven shape rather than creating a second Branch game loop.

## Next
Proceed from this stable CLR-21 proof to the next roadmap/content slice. When additional Observed Branches are authored, generalize via data (`stageIds`, `bossStageId`, standard Stage definitions, existing Encounter Pool/loot authorities) rather than new runtime or save ownership.
