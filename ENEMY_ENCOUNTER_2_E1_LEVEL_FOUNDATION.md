# Enemy 2.0 / Encounter 2.0 — E1 Enemy Lv Foundation

Status: **E1 COMPLETE CANDIDATE**

E1 introduces Enemy Lv as visible runtime metadata without changing combat or reward balance.

## Runtime contract

Every spawned enemy receives:

- `baseLevel`
- `level`

Both clamp to **Lv1–99,999**.

Initial source:

- `stage.enemyLevelBase` when explicitly authored,
- otherwise `stage.recLevel`,
- otherwise Lv1 fallback.

At E1, `level === baseLevel`.

## Important non-change

E1 does **not** use Enemy Lv to scale:

- HP
- ATK
- DEF
- SPD
- EXP
- Gold
- drops

Current Chapter/Abyss/Secret Realm values remain the E0 anchor values.

Relative level scaling and ordinary/random level bands belong to E2.

## Presentation

Text Battle enemy cards now show:

`<enemy name> Lv.<level>`

No new screen or navigation route is added.

## Runtime activation

`main.js` already loads `battle2RoadmapComplete.js`; that patch now imports `enemy2LevelFoundation.js`, keeping Enemy Lv inside the existing battle-runtime patch chain.

## E2 handoff

E2 may introduce anchor-relative level rolls/scaling only if:

- an enemy at `baseLevel` remains exactly equal to today's E0 stats,
- level differences stay bounded around the stage reference level,
- Bosses remain authored by default,
- reward scaling does not double-count existing Chapter/Abyss progression,
- fixed waves remain the fallback.
