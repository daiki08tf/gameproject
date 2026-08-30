# Content Pack IV — CP4-7 Final Integration Audit

Status: **COMPLETE — READY FOR OBSERVED BRANCHES M0**

## Scope

CP4-7 closes Content Pack IV by verifying that CP4-1 through CP4-6 remained a horizontal observation/discovery arc and did not mutate unrelated progression authorities.

Audit baseline:
- pre-CP4 main: `4eb99f84981285726c49a5d21c4db018e962bd12`
- CP4-6 merged main: `7a4955b72c55a9ba6e7da3faa4fdbd797e543f6a`

## Diff boundary audit

The pre-CP4 → CP4-6 repository comparison changes only:
- CP4 roadmap / audit / implementation records,
- `js/data/contentPackIVA.js` through `contentPackIVF.js`,
- `js/patches/contentPackIVA.js` through `contentPackIVF.js`,
- CP4 regression tests,
- one small Codex presentation change,
- one Home bootstrap import for `contentPackIVA.js`.

No Story chapter authority, Abyss, Rift, Secret Realm, Machine World, Deep Survey, World Tier, or core save/progression implementation file is changed by Content Pack IV.

The Home change is only the existing patch bootstrap chain import. It does not add a Home button or top-level mode.

## Contract results

### Story / access
- Ch1–35 Story data remains unchanged by CP4.
- Ch35 / `35-8` is only consumed as the prerequisite for CP4-1.
- Prime Chapter 2 / Deep Green remains the normal playable Region.
- The first observed Branch anchor remains `traversable:false`; CP4 never adds Branch travel.

### Existing endgame systems
- Abyss unlocks unchanged.
- Rift unlocks unchanged.
- Secret Realm unlocks unchanged.
- Machine World unlocks unchanged.
- Deep Survey unlocks unchanged.

### Branch Sight
- stored only as authored discovery state: `cp4:branch-sight:active`.
- boolean / non-numeric.
- not trainable or equippable.
- no battle bonus.
- no difficulty, World Tier, gear score, level, RNG, Unique, companion, job or rune gate.

### Persistence / economy
- no CP4 save root.
- authored state remains under existing `world2.discoveries`.
- no Branch currency, token, XP, level, stamina, energy or reset schedule.
- CP4-6 reward uses the existing Unique registry and `state.addItem()` pipeline.

### Secrecy / terminology
- unknown Branch count remains hidden.
- `深緑消失域` is not surfaced by the CP4 runtime.
- explicit Branch terminology is earned only after the perception-change / Branch Sight beat.
- Japan / Tokyo / Earth remain unrevealed.
- Transcendents remain unrevealed.

### Reward boundary
- `視差残響章` is a Prime-side observation keepsake.
- it is not mature `王樹領` technology.
- existing `mythic` rarity / `accessory` slot / existing effect authority only.
- no fourth Option and no Item Power override.
- equipping or owning it never gates later progression.

## Automated regression coverage

`tests/content-pack-iv-g.test.js` statically verifies the final CP4 boundary:
- bootstrap remains in-place rather than adding a Home mode,
- Branch Sight remains non-combat authored state,
- first Branch anchor remains non-traversable,
- CP4 reward remains optional and uses existing authorities,
- forbidden progression systems and hidden real-world reveals remain absent from runtime CP4 files,
- handoff target is Observed Branches M0–M4.

GitHub Actions required before merge:
- Blade Vale Tests
- Phase 8 Validation

## Acceptance result

Content Pack IV now delivers the intended progression:

```text
broken record
  → mutually impossible records
  → internally consistent histories
  → Parallax Core contact
  → perception change
  → Branch Sight
  → first fixed alternate history recognized
  → Prime-side identity reward
```

It does **not** become a difficulty-selected “multiverse mode”.

## Handoff

Next canonical work:

`OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md` → **M0 — Multiverse / authority audit**

M0–M4 own the first fully traversable `王樹領` implementation. Content Pack IV intentionally stops before Branch travel, Branch ecology, mature Branch technology, Branch combat regions, or Branch-origin equipment systems are introduced.