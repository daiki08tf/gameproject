# Debug pass notes

## Confirmed and fixed

### Pass 1
- Blacksmith 3.0 could overwrite an existing Legendary Effect when imprinting a different extracted effect. The old effect was lost without being extracted. A safety guard now requires the Legendary slot to be empty before imprinting.

### Pass 2
- Normal stage `dropTable` weapon drops could lose their unique instance id in battle results, hiding IP / Affix / Greater / Legendary details. `_rollDrop()` now gets the same instance-id handoff as dedicated weapon drop routes.
- Dynamically generated Abyss drop tables reintroduced retired equipment Runes after the one-time chapter-table migration had already run. Abyss now drops only current equipment through that table; Rune 2.0 remains on its independent route.
- Abyss modifier `瘴気だまり` still used legacy real-time contact damage, which does not exist in text battle. Its downside is now healing -30%, preserving a real risk/reward tradeoff.
- Auto Equip used a separate accessory path that skipped `canEquipItem()`, allowing required-level restrictions to be bypassed. Accessories now use the same guarded picker as other slots.
- Enhancing a legacy stacked weapon from the bag could consume its final physical copy as its own material. One target copy is now reserved whenever the target is not equipped.
- Restored/corrupt saves could have `nextInstanceSeq` behind existing `#N` ids, risking future instance collisions. The counter is repaired from persisted instance ids before allocation.
- Cached `greaterAffixCount` and Equipment 3.0 `displayName` could drift from persisted Affix/Legendary/Curse state after reload. They are now reconstructed from authoritative saved fields without rerolling.
- Battle result EXP accounting still read the legacy Job-side `gainExp().gained` field after Character/Job progression was split. Kill and stage-clear totals now reflect actual Character EXP credited by state. Stage-clear Gold result totals likewise reflect the actual credited Gold.

## Audited invariants

- Loot Filter 3.0 receives weapon instance ids, so IP / Greater / Legendary / Curse filters can inspect the actual rolled instance.
- Abyss E9 is anchored to Chapter 15 rather than the retired Chapter 10 endgame baseline.
- Abyss stage metadata exposes the target Item Power used by the Equipment 3.0 drop bridge.
- Equipment 3.0 instance repair changes metadata/counters only; it does not reroll Affixes, Greater outcomes, Legendary Effects, or Curses.

## Remaining design/integration findings

- Auto Equip now obeys all equip restrictions and evaluates weapon Affix effects, but it is still not fully build-aware: Legendary/Cursed synergy and player-specific skill rotations are not reduced to one guessed score during a bugfix pass.
- Base Affix rarity quality still uses `depthBonus = min(0.5, depth / 400)` and does not consume E9 `itemPowerTarget`. This means ordinary Affix rarity progression plateaus much earlier than IP 10,000, while Greater/Legendary continue scaling with IP. Treat this as an Equipment 3.0 balance/integration task, not a silent debug-number change.
- Blacksmith UI can still render imprint buttons on occupied Legendary slots; state logic safely rejects the operation. UI disabling is cosmetic/UX follow-up.
- The static Abyss hint in `index.html` still says "全10章" even though the current unlock checks all 15 chapters. This is copy drift only; unlock logic itself is correct.
