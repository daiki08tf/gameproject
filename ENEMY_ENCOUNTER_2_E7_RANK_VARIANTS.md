# Enemy 2.0 / Encounter 2.0 — E7 Rank / Rare / Variant Handoff

Status: **E7 COMPLETE CANDIDATE**

## Scope

E7 introduces the runtime contract for Chapter Rare, generic Elite and environmental Variant behavior while keeping the rollout on the existing Ch1 Encounter Pool pilot. Ch1–30 migration remains E8.

## Generic Elite safety boundary

Historical `enemy.elite === true` remains reserved for Abyss reward-eligible Elites. That flag is consumed by the existing Abyss kill payout path and can award Abyss Shards.

Generic World Tier Elite now uses:

```js
{
  rank: 'elite',
  genericElite: true,
  elite: false,
}
```

This keeps ordinary World Tier Elite from accidentally entering the historical Abyss currency path.

Generic Elite receives bounded HP/ATK/DEF and XP/Gold rank pressure, then E7 retargets its Enemy Lv to the authored **120–145%** stage band. Existing World Tier multipliers remain authoritative and are not reapplied by E7.

## Chapter Rare

Ch1 stages `1-2` through `1-5` are explicitly Rare-capable:

- base encounter presence: **4%**,
- World Tier influence: +0.4 percentage points per World Tier rank, capped by the shared 8% safety ceiling,
- candidate: authored `ch1_rare`,
- at most one encounter slot is replaced by the Rare,
- Boss encounter specs bypass Rare planning,
- Rare Enemy Lv uses the authored **115–135%** band,
- Rare is never required for story progression.

The E5 spawn bridge accepts an E7-only explicit slot override. Normal E5/E6 role-first fallback behavior is unchanged when no Rare roll succeeds.

## Environmental Variant pilot

Ch1 uses the `grassland` encounter context and a bounded 10% Variant roll for eligible ordinary enemies.

Initial Variant:

- `grassland_windswept` / `風渡り`,
- eligible roles: normal / fast / attacker,
- small ATK/SPD flavor bias with tiny XP/Gold context bonus,
- no new species ID,
- `speciesId` and species/family identity remain unchanged,
- Boss and authored Chapter Rare are excluded from this pilot conversion.

## World Tier integration

World Tier keeps its existing stat/reward/drop multipliers and existing `eliteChance` progression. E7 changes only the identity of the generated ordinary-content Elite from historical Abyss `elite` to generic `rank='elite'` / `genericElite=true`.

Abyss stages still return before World Tier ordinary-content scaling and therefore retain their historical depth / pact / Elite behavior unchanged.

## UI

Text Battle enemy names append compact rank labels:

- `[RARE]`
- `[ELITE]`

Enemy Lv remains provided by the E1 display layer. Variant flavor is expressed through the resolved enemy name, e.g. `風渡りスライム`.

## Acceptance coverage

`tests/enemy2-e7-rank-variants.test.js` covers:

- authored Rare / Elite level bands,
- generic Elite never setting historical `enemy.elite`,
- historical Abyss Elite remaining untouched,
- explicit Rare-capable pool requirement,
- bounded World Tier influence on Rare chance,
- Boss exclusion,
- same-species environmental Variant identity,
- bounded Variant modifiers.

## Next: E8

Progressively migrate Ch1–30 stages from the pilot contract to Encounter Pool + template + rank/variant behavior while retaining fixed `waves` as fallback and preserving authored Boss order.
