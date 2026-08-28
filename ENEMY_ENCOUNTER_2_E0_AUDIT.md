# Enemy 2.0 / Encounter 2.0 — E0 Audit

Status: **E0 COMPLETE CANDIDATE**

This audit freezes the current enemy/spawn assumptions before Enemy Lv or Encounter Pool migration begins.

## Current enemy sources

1. `js/data/enemies.js`
   - canonical `ENEMY_TYPES` registry,
   - Ch1 legacy enemy IDs,
   - Ch2–30 generated `normal / fast / tank / boss`,
   - expanded chapters may add `midboss / branchboss`.
2. `js/data/abyss.js`
   - dynamically writes depth-specific enemy types into `ENEMY_TYPES`,
   - applies Abyss combat/reward scaling before BattleEngine spawn.
3. Secret Realm / Deep Survey / Raid builders
   - continue to resolve through ordinary stage `waves` and the shared registry/battle path.
4. `js/battleEngine.js`
   - `beginNextEncounter()` consumes fixed wave specs,
   - `_spawnEnemy(type)` resolves `ENEMY_TYPES[type]`, applies Abyss runtime adjustments, then creates battle-local enemy state.

## Current story model

Story stages still own fixed `waves`.

The ordinary generated identity model is primarily:

- `normal`
- `fast`
- `tank`
- authored Boss

Later chapters add midboss/branch boss content, but ordinary encounter diversity is still fundamentally three-role.

## Balance anchor decision

E1/E2 must not delete current Chapter scaling.

The current generated stats are the **anchor stats** at the enemy's reference level. Enemy Lv is introduced first as runtime metadata; level-relative stat scaling comes only in E2.

This prevents Enemy 2.0 from silently rebasing the whole game during the first migration step.

## Elite hazard

Current `enemy.elite` is not a neutral rank flag.

`battleEngine.js` awards `ABYSS_EXPANSION_LAYER.ELITE_SHARD_DROP` whenever `enemy.elite` is true. Today that flag is produced by the Abyss-specific spawn path, so the coupling is safe.

Therefore future generic/world Elite enemies must either:

- use a separate rank marker, or
- gate Abyss Shard payout by `stage.isAbyss` / an explicit Abyss-elite source.

**Do not reuse `enemy.elite=true` for global/random Elite before this payout contract is separated.**

## Migration fallback

Fixed `waves` remain authoritative and supported throughout E1–E7.

Encounter Pools will be optional. If a stage has no valid pool, the current wave path must run unchanged.

Bosses remain authored by default.

## Automated audit

Run:

```bash
npm run audit:enemy2
```

Regression coverage: `tests/enemy2-e0-audit.test.js`.

Representative runtime construction covers:

- Ch1
- Ch10
- Ch20
- Ch30
- Abyss depth 1200 via the real builder
- Deep Survey via the real builder

The suite verifies that representative waves resolve to registered enemy data and freezes the important Elite/Abyss coupling and fixed-wave fallback contracts.

## E1 handoff

E1 may now add visible/runtime Enemy Lv metadata only.

E1 should:

- clamp Enemy Lv to 1–99,999,
- derive a reference/anchor level from stage context,
- attach `level` and `baseLevel` to spawned enemies,
- preserve current HP/ATK/DEF/SPD/XP/Gold exactly at this phase,
- preserve every existing stage wave and reward path,
- avoid generic Elite work until the Elite payout coupling is separated in its planned phase.

Level-relative stat scaling belongs to E2, not E1.
