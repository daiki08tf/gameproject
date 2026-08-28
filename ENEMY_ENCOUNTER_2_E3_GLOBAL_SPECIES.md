# Enemy 2.0 / Encounter 2.0 — E3 Global Species

Status: **E3 COMPLETE CANDIDATE**

E3 adds the first reusable world-level enemy species catalog without changing existing story encounters yet.

## Canonical species

12 Global Species are defined in `js/data/globalEnemySpecies.js`:

- スライム
- コウモリ
- ゴブリン
- ウルフ
- スケルトン
- ゴーレム
- ウィスプ
- 毒キノコ
- 小精霊
- リザード
- ミミック
- 彷徨う鎧

Each has:

- stable `speciesId`
- display name
- base role
- family
- habitat tags
- spawn weight
- `trueGlobal` flag

## True-global reference

`slime` is the first `trueGlobal` species.

It is eligible regardless of habitat and acts as the reference case for enemies that can plausibly appear almost anywhere in the world.

Other Global Species are reusable across many regions but remain habitat-aware. This prevents the future Encounter Pool from making every region feel identical.

## Role coverage

The catalog already spans the future seven ordinary roles:

- normal
- fast
- tank
- attacker
- caster
- trickster
- support

E3 only defines identity/stat profiles. Role-specific combat behavior remains later work.

## Materialization

`materializeGlobalSpecies(speciesId, anchorEnemy)` derives a species-shaped enemy from an existing regional role anchor.

This intentionally avoids giving a Lv1-style global template directly to a high-level stage. Encounter Pool integration will materialize Global Species from the destination activity/region anchor, after which Enemy Lv E1/E2 can apply normally.

## Non-change

E3 does not yet:

- insert Global Species into Ch1–30 waves,
- randomize encounters,
- add Rare/Elite rolls,
- alter Bosses,
- alter rewards,
- add save data or currencies.

Existing fixed waves remain exactly as before.

## Next

E4 expands Ch1–30 regional ordinary content toward:

**7 ordinary roles + 1 Rare identity per Chapter/region**.
